"""Test-only finishing of a fixed S18 synthetic picture master; not a product renderer."""
import hashlib
import math
import re
import struct
import subprocess
import wave
from pathlib import Path

FONT = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')


def finish_master(manifest, picture, picture_hash, cues, target):
    """Use only trusted local synthetic picture, tones and bounded ASCII cue fixtures."""
    w, h, duration = manifest['width'], manifest['height'], manifest['duration_ms']
    if (w, h) not in {(180, 320), (320, 180)} or manifest['fps'] != 25:
        raise ValueError('unsupported fixture profile')
    if duration <= 0 or duration % 40 or duration > 10000:
        raise ValueError('invalid fixture timeline')
    cursor = 0
    media = []
    for segment in manifest['segments']:
        start, length = segment['timeline_start_ms'], segment['duration_ms']
        if start != cursor or length <= 0 or length % 40 or segment['kind'] not in ('media', 'gap'):
            raise ValueError('invalid segment timeline')
        cursor += length
        if segment['kind'] == 'media':
            media.append((start, cursor))
    if cursor != duration or len(media) != 2:
        raise ValueError('invalid fixture timeline')
    previous = 0
    for start, end, text in cues:
        if not 0 <= start < end <= duration:
            raise ValueError('cue outside timeline')
        if start % 40 or end % 40:
            raise ValueError('cue off frame grid')
        if start < previous:
            raise ValueError('cue overlap')
        if not any(a <= start < end <= b for a, b in media):
            raise ValueError('cue crosses media segment')
        if not re.fullmatch(r'DEMO [AB]', text):
            raise ValueError('invalid fixture text')
        previous = end
    if not picture.is_file() or hashlib.sha256(picture.read_bytes()).hexdigest() != picture_hash:
        raise ValueError('picture hash mismatch')
    if not FONT.is_file():
        raise ValueError('fixture font unavailable')
    if target.exists():
        raise FileExistsError(target)
    # Exact 48 samples per millisecond. Tone identities are synthetic, not source dialogue.
    audio = target.with_suffix('.wav')
    with audio.open('xb') as stream, wave.open(stream, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(48000)
        samples = bytearray()
        for segment in manifest['segments']:
            start = segment['timeline_start_ms']
            count = segment['duration_ms']*48
            frequency = (440, 660)[next((i for i, (a, _) in enumerate(media) if a == start), 0)]
            for i in range(count):
                value = round(0.16*32767*math.sin(2*math.pi*frequency*i/48000)) if segment['kind'] == 'media' else 0
                samples.extend(struct.pack('<h', value))
        wav.writeframes(samples)
    bottom = h//5 if h > w else h//10
    filters = []
    for start, end, text in cues:
        filters.append(f"drawtext=fontfile={FONT}:text={text}:fontsize=16:fontcolor=white:"
                       f"x=(w-tw)/2:y=h-{bottom}-th-3:enable='between(n,{start//40},{end//40-1})'")
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-filter_threads', '1',
                    '-protocol_whitelist', 'file,pipe', '-i', str(picture),
                    '-protocol_whitelist', 'file,pipe', '-i', str(audio),
                    '-map', '0:v:0', '-map', '1:a:0', '-vf', ','.join(filters) or 'null',
                    '-c:v', 'libx264', '-threads', '1', '-pix_fmt', 'yuv420p',
                    '-r', '25', '-video_track_timescale', '12800', '-c:a', 'aac',
                    '-b:a', '96k', '-ar', '48000', '-ac', '1', '-movflags', '+faststart',
                    '-n', str(target)], check=True, timeout=30)
