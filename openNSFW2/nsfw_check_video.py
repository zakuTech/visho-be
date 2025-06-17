import sys
import json
import cv2
import tempfile
import os
from opennsfw2 import predict_image

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Path video tidak diberikan"}))
        return

    video_path = sys.argv[1]
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(json.dumps({"error": "Gagal membuka video"}))
        return

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = 1 if frame_count < 10 else round(frame_count / 10)

    print(f"[INFO] Total frame: {frame_count}, Interval: {frame_interval}", file=sys.stderr)

    scores = []
    processed = 0

    for i in range(0, frame_count, frame_interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        success, frame = cap.read()
        if not success:
            print(f"[WARN] Frame {i} gagal dibaca", file=sys.stderr)
            continue

        tmp_dir = tempfile.gettempdir()
        frame_path = os.path.join(tmp_dir, f"frame_{i}.jpg")
        try:
            cv2.imwrite(frame_path, frame)
            score = predict_image(frame_path)
            scores.append(score)
            processed += 1
            print(f"[DEBUG] Frame {i} score: {score}", file=sys.stderr)
        except Exception as e:
            print(f"[ERROR] Gagal proses frame {i}: {e}", file=sys.stderr)
        finally:
            if os.path.exists(frame_path):
                try:
                    os.remove(frame_path)
                except Exception as cleanup_err:
                    print(f"[WARN] Gagal hapus {frame_path}: {cleanup_err}", file=sys.stderr)

    cap.release()
    print(f"[INFO] Frames processed: {processed}, Total Scores: {len(scores)}", file=sys.stderr)

    if scores:
        avg_score = sum(scores) / len(scores)
        if avg_score >= 0.7:
            label = "porn"
        elif avg_score >= 0.4:
            label = "sexy"
        else:
            label = "neutral"
    else:
        avg_score = 0
        label = "unknown"

    # Output JSON ONLY ke stdout
    print(json.dumps({
        "avg_score": round(avg_score, 4),
        "class": label
    }))

if __name__ == "__main__":
    main()
