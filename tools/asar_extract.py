"""Minimal ASAR archive extractor (read-only)."""

import json
import os
import struct
import sys


def parse_header(fp):
    fp.seek(0)
    head = fp.read(64)
    sz1, sz2 = struct.unpack("<II", head[:8])
    base = 8 + sz2
    start = head.find(b"{", 8)
    if start < 0:
        raise RuntimeError("no json header found")
    fp.seek(start)
    raw = fp.read(base - start)
    header = json.loads(raw.decode("utf-8", "replace").rstrip("\x00"))
    return header, base


def walk(fp, node, base, prefix, outdir, count):
    for name, meta in node.get("files", {}).items():
        path = os.path.join(prefix, name)
        if "files" in meta:
            os.makedirs(os.path.join(outdir, path), exist_ok=True)
            count = walk(fp, meta, base, path, outdir, count)
        else:
            if meta.get("unpacked"):
                continue
            fp.seek(base + int(meta["offset"]))
            data = fp.read(int(meta["size"]))
            target = os.path.join(outdir, path)
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "wb") as fh:
                fh.write(data)
            count += 1
    return count


def main():
    src = sys.argv[1]
    outdir = sys.argv[2]
    with open(src, "rb") as fp:
        header, base = parse_header(fp)
        count = walk(fp, header, base, "", outdir, 0)
    print("extracted", count, "files to", outdir)
    print("integrity keys:", list(header.keys()))
    if "integrity" in header:
        print("integrity algorithm:", header["integrity"].get("algorithm"))


main()
