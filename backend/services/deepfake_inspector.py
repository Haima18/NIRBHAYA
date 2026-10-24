"""Honest media-container inspection.

This module does not claim to detect deepfakes. It validates file signatures,
extracts available container/EXIF information, and reports that authenticity was
NOT determined. A neural detector can be connected later only if a real service
is configured and independently evaluated.
"""
import os
import mimetypes
from datetime import datetime, timezone
from PIL import Image, ExifTags, UnidentifiedImageError
from config import Config

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov', 'mp3', 'wav'}
MAX_IMAGE_PIXELS = 40_000_000
Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


def is_allowed_file(filename: str) -> bool:
    return isinstance(filename, str) and '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _read_head(path: str, length: int = 32) -> bytes:
    with open(path, 'rb') as handle:
        return handle.read(length)


def _detect_signature(head: bytes) -> str:
    if head.startswith(b'\xff\xd8\xff'):
        return 'jpeg'
    if head.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'png'
    if head[:4] == b'RIFF' and head[8:12] == b'WEBP':
        return 'webp'
    if head[:4] == b'RIFF' and head[8:12] == b'WAVE':
        return 'wav'
    if len(head) >= 12 and head[4:8] == b'ftyp':
        return 'mp4/mov'
    if head.startswith(b'\x1aE\xdf\xa3'):
        return 'webm/matroska'
    if head.startswith(b'ID3') or head[:2] in (b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'):
        return 'mpeg-audio'
    return 'unknown'


def _expected_kind(original_filename: str) -> str:
    extension = original_filename.rsplit('.', 1)[-1].lower()
    if extension in {'jpg', 'jpeg', 'png', 'webp'}:
        return 'image'
    if extension in {'mp4', 'webm', 'mov'}:
        return 'video'
    if extension in {'mp3', 'wav'}:
        return 'audio'
    return 'unknown'


def _signature_kind(signature: str) -> str:
    if signature in {'jpeg', 'png', 'webp'}:
        return 'image'
    if signature in {'mp4/mov', 'webm/matroska'}:
        return 'video'
    if signature in {'wav', 'mpeg-audio'}:
        return 'audio'
    return 'unknown'


def inspect_media_file(file_path: str, original_filename: str) -> dict:
    try:
        file_size = os.path.getsize(file_path)
    except (TypeError, OSError):
        file_size = 0

    mime_type, _ = mimetypes.guess_type(original_filename or '')
    mime_type = mime_type or 'application/octet-stream'
    expected_kind = _expected_kind(original_filename or '')
    signature = _detect_signature(_read_head(file_path))
    signature_kind = _signature_kind(signature)
    signature_matches = signature_kind != 'unknown' and signature_kind == expected_kind

    checks = []
    metadata = {
        'fileName': original_filename or 'unknown',
        'fileSize': file_size,
        'mimeType': mime_type,
        'hasExif': False,
        'signature': signature,
        'signatureMatchesExtension': signature_matches,
    }

    checks.append({
        'checkName': 'File signature vs. extension',
        'status': 'pass' if signature_matches else 'anomaly',
        'explanation': (
            f'The file header is consistent with the .{original_filename.rsplit(".", 1)[-1]} extension ({signature}).'
            if signature_matches
            else 'The file header does not match the expected media type for this extension. The file may be corrupted, renamed, or mislabeled.'
        ),
    })

    if expected_kind == 'image':
        try:
            with Image.open(file_path) as image:
                milliseconds = int((image.info.get('duration') or 0))
                frame_count = int(getattr(image, 'n_frames', 1) or 1)
                image.verify()
            with Image.open(file_path) as image:
                metadata['dimensions'] = f"{image.width} x {image.height} px"
                if image.width * image.height > MAX_IMAGE_PIXELS:
                    checks.append({
                        'checkName': 'Image dimensions',
                        'status': 'anomaly',
                        'explanation': 'Image dimensions exceed the safe inspection limit.',
                    })
                exif_data = image.getexif()
                if exif_data:
                    metadata['hasExif'] = True
                    exif_tags = {}
                    for tag_id, value in exif_data.items():
                        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                        exif_tags[tag_name] = str(value)[:100]
                    if 'Make' in exif_tags or 'Model' in exif_tags:
                        metadata['cameraModel'] = ' '.join(
                            part for part in [exif_tags.get('Make'), exif_tags.get('Model')] if part
                        ).strip()
                    if 'Software' in exif_tags:
                        metadata['software'] = exif_tags['Software']
        except (UnidentifiedImageError, Image.DecompressionBombError, OSError, ValueError):
            checks.append({
                'checkName': 'Image decoding',
                'status': 'anomaly',
                'explanation': 'The image could not be decoded. It may be corrupted or not a real image file.',
            })

        if metadata.get('hasExif'):
            checks.append({
                'checkName': 'EXIF metadata',
                'status': 'pass',
                'explanation': f"EXIF metadata is present. Device/software: {metadata.get('cameraModel') or metadata.get('software') or 'recorded'}.",
            })
        else:
            checks.append({
                'checkName': 'EXIF metadata',
                'status': 'warning',
                'explanation': 'No EXIF metadata was found. Messaging apps and screenshot tools routinely remove EXIF, so this is not evidence of manipulation.',
            })

    if expected_kind in {'video', 'audio'}:
        checks.append({
            'checkName': 'Frame / audio signal analysis',
            'status': 'warning',
            'explanation': 'No frame-level or audio-signal forensics are implemented. This inspection only validates the container signature and file metadata.',
        })

    checks.append({
        'checkName': 'Neural deepfake detector',
        'status': 'warning',
        'explanation': (
            'No detector is bundled or configured. Authenticity could not be established.'
            if not Config.DEEPFAKE_DETECTOR_URL
            else 'An external detector URL is configured, but this build does not transmit media to it automatically. Detect messages separately.'
        ),
    })

    disclaimer = (
        'IMPORTANT: Authenticity has NOT been determined. This tool validates file type and reads available metadata only. '
        'It cannot prove that media is real or synthetic. Screenshots and messaging apps may strip metadata. '
        'Do not rely on this result as forensic proof; preserve the original file and seek a qualified digital forensics examiner.'
    )

    guidance = [
        'Keep the original file and its original filename/date. Do not delete or overwrite it before seeking advice.',
        'Save the full conversation, sender handle, profile URL, and payment demands in your Evidence Vault.',
        'Do not pay an extortionist or send additional images. Payment does not guarantee deletion.',
        'For intimate imagery, consider a StopNCII.org hash report and the platform takedown process.',
        'Report to cybercrime.gov.in or call 1930. For immediate threats, call 112.',
        'A qualified digital-forensics examiner is needed before treating any media as authenticated evidence.',
    ]
    return {
        'fileName': original_filename,
        'analyzedAt': datetime.now(timezone.utc).isoformat(),
        'mediaType': expected_kind,
        'metadata': metadata,
        'heuristics': checks,
        'authenticityStatus': 'not_determined',
        'detectorConfigured': bool(Config.DEEPFAKE_DETECTOR_URL),
        'method': 'metadata-and-signature-inspection',
        'disclaimer': disclaimer,
        'guidance': guidance,
    }
