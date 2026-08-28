from pathlib import Path
import json

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = PROJECT_ROOT / 'src' / 'data' / 'materials.json'
OUTPUT_PATH = PROJECT_ROOT / 'data-source' / '材料数据.xlsx'


def main() -> None:
    if OUTPUT_PATH.exists():
        raise FileExistsError(f'文件已存在，不覆盖：{OUTPUT_PATH}')

    with SOURCE_PATH.open('r', encoding='utf-8') as source_file:
        materials = json.load(source_file)

    names = [material['name'] for material in materials]

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = '材料介绍'
    worksheet.append(['材料名称', '介绍'])

    for name in names:
        worksheet.append([name, None])

    for cell in worksheet[1]:
        cell.font = Font(bold=True)

    worksheet.column_dimensions['A'].width = 20
    worksheet.column_dimensions['B'].width = 80
    for row in worksheet.iter_rows(min_col=2, max_col=2):
        row[0].alignment = Alignment(wrap_text=True, vertical='top')

    workbook.save(OUTPUT_PATH)
    print(f'已生成材料模板，共 {len(names)} 条材料。')


if __name__ == '__main__':
    main()
