import os
import sys

sigs = {
    b"PK\x03\x04": "zip-local",
    b"7z\xbc\xaf\x27\x1c": "7z",
    b"MSCF": "cab",
    b"Rar!\x1a\x07": "rar",
    b"\x1f\x8b\x08": "gzip",
    b"BZh9": "bzip2",
    b"\xfd7zXZ": "xz",
    b"UPX!": "upx",
    b"NSIS": "nsis",
    b"IEND\xaeB`\x82": "png-iend",
    b"Nuitka": "nuitka",
    b"PyInstaller": "pyinstaller",
    b"MEI\x0c\x0b\x0a\x0b\x0e": "pyinstaller-cookie",
    b"pyi-": "pyi",
    b"python3": "python3",
    b"Qt6": "qt6",
    b"Qt5": "qt5",
    b"chrome": "chrome",
    b"V8": "v8",
    b"wails": "wails",
    b"__v8": "v8dup",
}


def main():
    path = sys.argv[1]
    data = open(path, "rb").read()
    print("path", path)
    print("size", len(data))
    for sig, name in sigs.items():
        idxs = []
        start = 0
        while len(idxs) < 30:
            i = data.find(sig, start)
            if i < 0:
                break
            idxs.append(i)
            start = i + 1
        print(f"{name:22s} {len(idxs):4d} {idxs[:8]}")
    # count printable ASCII density in first 10MB vs whole
    print("head64", data[:64].hex(" "))


main()
