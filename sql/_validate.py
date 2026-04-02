import re
from collections import Counter

filepath = r'c:\Users\84414\Desktop\TODO\Page Builder\wireframe\sql\03_DML_screen.sql'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File length: {len(content)} chars")

# Check what quote chars are around the IDs
idx = content.find('sd010010')
if idx >= 0:
    snippet = content[idx-2:idx+35]
    print(f"Snippet around sd: {repr(snippet)}")

# Split at SCRN_H inserts to isolate SCRN_CMP_D section
parts = content.split('INSERT INTO TB_PFCM_UI_SCRN_H')
cmp_section = parts[0] if len(parts) > 1 else content

# Use broader pattern - sd/sc/sh + 30 digits = 32 chars total
sd_ids2 = re.findall(r"(sd[0-9]+)", content)
if sd_ids2:
    print(f"First sd match: {sd_ids2[0]} (len={len(sd_ids2[0])})")

# The actual pattern is: prefix(2) + digits(30) = 32 chars
sd_ids = re.findall(r"(sd[0-9]{30})", cmp_section)
print(f"sd matches (30 digits): {len(sd_ids)}")
sd_unique = sorted(set(sd_ids))

# Extract sc/sh from whole file  
sc_ids = sorted(set(re.findall(r"(sc[0-9]{30})", content)))
sh_ids = sorted(set(re.findall(r"(sh[0-9]{30})", content)))

print("=== SCRN_M (sc) PKs ===")
for u in sc_ids:
    print(f"  {u} (len={len(u)})")
print(f"  Unique: {len(sc_ids)}")

print("\n=== SCRN_CMP_D (sd) unique PKs ===")
for u in sd_unique:
    print(f"  {u} (len={len(u)})")
print(f"  Unique: {len(sd_unique)}")

for scr in ['01','02','03']:
    cnt = len([x for x in sd_unique if x.startswith(f'sd{scr}')])
    print(f"  Screen {scr}: {cnt} components")

print(f"\n=== SCRN_H (sh) PKs ===")
for u in sh_ids:
    print(f"  {u} (len={len(u)})")
print(f"  Unique: {len(sh_ids)}")

# Length check
all_ids = sd_unique + sc_ids + sh_ids
bad = [x for x in all_ids if len(x) != 32]
print(f"\n=== Length check: {len(bad)} bad IDs ===")
for b in bad:
    print(f"  BAD: {b} (len={len(b)})")

# Duplicate check in SCRN_CMP_D inserts
sd_counter = Counter(sd_ids)
real_dups = {k: v for k, v in sd_counter.items() if v > 1}
if real_dups:
    print("\n=== DUPLICATE sd PKs ===")
    for k, v in real_dups.items():
        print(f"  {k} appears {v} times")
else:
    print("\n=== No duplicate sd PKs OK ===")

print("\nValidation complete")
