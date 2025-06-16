// import {
//   Injectable,
//   NestMiddleware,
//   BadRequestException,
// } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { spawnSync } from 'child_process';
// import * as fs from 'fs';
// import * as multer from 'multer';
// import * as path from 'path';

// const upload = multer({ dest: 'uploads/' });

// interface NsfwOutput {
//   nsfw_score: number;
// }
// @Injectable()
// export class NsfwMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     upload.single('media_file')(req, res, async (err) => {
//       if (err) {
//         throw new BadRequestException('Upload error: ' + err.message);
//       }

//       const filePath = req.file?.path;
//       if (!filePath) {
//         return res.status(400).json({
//           success: false,
//           message: 'Tidak ada file yang diunggah.',
//         });
//       }

//       try {
//         const pythonPath = path.join(
//           process.cwd(),
//           'venv',
//           'Scripts',
//           'python.exe',
//         );
//         const pythonScriptPath = path.join(
//           process.cwd(),
//           'openNSFW2',
//           'nsfw_check.py',
//         );
//         const absImagePath = path.resolve(filePath);
//         const result = spawnSync(pythonPath, [pythonScriptPath, absImagePath], {
//           encoding: 'utf8',
//         });

//         console.log(
//           'Which python:',
//           spawnSync('where', ['python'], { encoding: 'utf8' }).stdout,
//         );
//         console.log('Python exit code:', result.status);
//         console.log('filePath:', filePath);
//         console.log('stdout:', result.stdout);
//         console.log('stderr:', result.stderr);

//         if (result.error) {
//           console.error('NSFW spawnSync error:', result.error);
//           return res.status(500).json({
//             success: false,
//             message:
//               'Terjadi kesalahan saat memproses gambar. Pastikan sistem Python terinstal dengan benar.',
//             detail: result.error.message,
//           });
//         }

//         console.log('stdout:', result.stdout);
//         console.log('stderr:', result.stderr);

//         if (!result.stdout) {
//           console.error(
//             'NSFW script returned empty output:',
//             result.stderr || 'No stderr',
//           );
//           return res.status(500).json({
//             success: false,
//             message:
//               'Gagal memverifikasi gambar. Tidak ada respons dari skrip NSFW.',
//             suggestion:
//               'Pastikan format gambar benar dan sistem Python berjalan normal.',
//           });
//         }

//         let output: NsfwOutput;
//         try {
//           output = JSON.parse(result.stdout);
//         } catch (parseError) {
//           console.error('JSON parse error:', parseError);
//           console.error('Failed to parse JSON:', result.stdout);
//           throw new BadRequestException('Failed to parse NSFW response');
//         }

//         fs.unlinkSync(filePath); // bersihkan file setelah proses

//         if (output?.nsfw_score && output.nsfw_score > 0.7) {
//           res.status(400).json({
//             success: false,
//             message:
//               'Gambar yang Anda unggah terdeteksi mengandung konten NSFW (Not Safe For Work).',
//             nsfw_score: output.nsfw_score,
//             suggestion:
//               'Silakan unggah gambar lain yang tidak mengandung unsur dewasa atau tidak pantas.',
//           });
//           return;
//         }

//         return next();
//       } catch (error: any) {
//         console.error('NSFW error:', error.message || error);
//         throw new BadRequestException(
//           'NSFW check failed: ' + (error.message || error),
//         );
//       }
//     });
//   }
// }

// ---------------------------------------------------------------------

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';

const upload = multer({ dest: 'uploads/' });

interface NsfwOutput {
  nsfw_score: number;
  class: string;
  avg_score?: number; // Untuk video
}

@Injectable()
export class NsfwMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload.single('media_file')(req, res, async (err) => {
      console.log('DEBUG file:', req.file);
      console.log('DEBUG body:', req.body);

      if (err) {
        console.error('Multer Error:', err);
        return res.status(400).json({
          message: 'Upload gagal',
          detail: err.message,
        });
      }

      const filePath = req.file?.path;
      const originalName = req.file?.originalname;

      if (!filePath || !originalName) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diunggah.',
        });
      }

      const ext = path.extname(originalName).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      const isVideo = ['.mp4', '.mov', '.avi'].includes(ext);

      if (!isImage && !isVideo) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Gagal hapus file (format tidak valid):', err.message);
        }
        return res.status(400).json({
          success: false,
          message: 'Format file tidak didukung untuk pengecekan NSFW.',
        });
      }

      const scriptName = isImage ? 'nsfw_check.py' : 'nsfw_check_video.py';
      const pythonPath = path.join(
        process.cwd(),
        'venv',
        'Scripts',
        'python.exe',
      );
      const scriptPath = path.join(process.cwd(), 'openNSFW2', scriptName);
      const absFilePath = path.resolve(filePath);

      const result = spawnSync(pythonPath, [scriptPath, absFilePath], {
        encoding: 'utf8',
      });

      // Baca buffer sebelum file dihapus
      let buffer: Buffer;
      try {
        buffer = fs.readFileSync(filePath);
      } catch (err) {
        console.error('Gagal membaca file sebelum hapus:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Gagal membaca file sementara.',
        });
      }

      // Hapus file satu kali saja
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Gagal menghapus file sementara:', err.message);
      }

      // Inject data ke req.body
      (req.body as any).media_file_buffer = buffer;
      (req.body as any).media_file_mimetype = req.file.mimetype;
      (req.body as any).media_file_originalname = originalName;

      if (result.error) {
        console.error('NSFW spawn error:', result.error);
        return res.status(500).json({
          success: false,
          message: 'Gagal menjalankan pengecekan NSFW.',
          detail: result.error.message,
        });
      }

      if (!result.stdout) {
        return res.status(500).json({
          success: false,
          message: 'Tidak ada output dari skrip NSFW.',
          stderr: result.stderr,
        });
      }

      let output: NsfwOutput;
      try {
        output = JSON.parse(result.stdout);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return res.status(500).json({
          success: false,
          message: 'Gagal memproses respons dari skrip NSFW.',
          raw: result.stdout,
        });
      }

      const score = isImage ? output.nsfw_score : output.avg_score;
      const nsfwClass = output.class;

      if (nsfwClass === 'porn' || nsfwClass === 'sexy' || score >= 0.7) {
        return res.status(400).json({
          success: false,
          message: `Konten NSFW terdeteksi: ${nsfwClass}`,
          score: score,
          suggestion:
            'Silakan unggah konten lain yang tidak mengandung unsur dewasa.',
        });
      }
      console.log('NSFW check result:', {
        score,
        nsfwClass,
      });

      // Lolos filter
      return next();
    });
  }
}
