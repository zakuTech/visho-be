# nsfw_check.py
import sys
import json
from opennsfw2 import predict_image

if len(sys.argv) < 2:
    print(json.dumps({ "error": "no file path provided" }))
    sys.exit(1)

image_path = sys.argv[1]

try:
    score = predict_image(image_path)
    print(json.dumps({ "nsfw_score": float(score) }))
except Exception as e:
    print(json.dumps({ "error": str(e) }))
    sys.exit(1)
