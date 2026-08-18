import sys, io
buf = io.StringIO()
old = sys.stderr
sys.stderr = buf
try:
    exec(open('videos/sora-shutdown-2026/work/make_shot_plan.py', encoding='utf-8').read())
except SystemExit:
    pass
sys.stderr = old
err = buf.getvalue()
print('STDERR:', repr(err[:2500]))
