import json
import pathlib

import pandas as pd


def main():
    """
    读取国产元器件分类 Excel，并导出为 JSON。

    - 输入：E:\\产品数据\\元器件产品体系分类表简化版（公开）.xlsx
      读取第一个工作表，空值填充为空字符串
    - 输出：F:\\Business_plat\\classification.json
    - 结构示例：
      {
        "level1": "数字单片集成电路",
        "level2": "微处理器",
        "level3": "中央处理器（CPU）"
      }
    """
    src = pathlib.Path(r"E:\产品数据\元器件产品体系分类表简化版（公开）.xlsx")
    out = pathlib.Path(r"F:\Business_plat\classification.json")

    df = pd.read_excel(src, sheet_name=0).fillna("")

    records = [
        {"level1": row[0], "level2": row[1], "level3": row[2]}
        for row in df.itertuples(index=False)
    ]

    out.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"saved to {out} ({len(records)} rows)")
    print("preview (first 5 rows):")
    for item in records[:5]:
        print(item)


if __name__ == "__main__":
    main()

