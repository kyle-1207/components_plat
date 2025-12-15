import json
import pathlib
from typing import Dict, List

import pandas as pd


SRC_PATH = pathlib.Path(r"E:\产品数据\商业航天数据\商业航天产品数据信息表.xlsx")
OUT_PATH = pathlib.Path(r"F:\Business_plat\domestic_products.json")

# 原始表头到内部字段的映射
COLUMN_MAP = {
    "序号": "seq",  # 将按生产厂商重新编号
    "一级分类": "level1",
    "二级分类": "level2",
    "三级分类": "level3",
    "元器件名称": "name",
    "生产厂商": "manufacturer",
    "规格型号": "model",
    "关键功能性能指标": "key_specs",
    "工作温度范围（单位：℃）": "temperature_range",
    "抗辐照指标（单位：kRad. Si）": "radiation",
    "封装形式": "package",
    "质量等级": "quality",
    "参考价格区间": "price_range",
    "货期周期": "lead_time",
    "航天供货": "space_supply",
    "是否主推产品": "is_promoted",
    "联系人": "contact",
    "材料编码": "material_code",
}


def renumber_by_manufacturer(records: List[Dict]) -> List[Dict]:
    """
    对每个 manufacturer 下的记录，将 seq 从 1 开始递增。
    """
    counters: Dict[str, int] = {}
    for rec in records:
        mfr = rec.get("manufacturer", "") or "UNKNOWN"
        counters[mfr] = counters.get(mfr, 0) + 1
        rec["seq"] = counters[mfr]
    return records


def main():
    # 读取 Excel
    df = pd.read_excel(SRC_PATH, sheet_name=0)

    # 仅保留映射列，缺失的列填空
    missing_cols = [col for col in COLUMN_MAP if col not in df.columns]
    for col in missing_cols:
        df[col] = ""

    df = df[list(COLUMN_MAP.keys())].fillna("")

    # 重命名列为内部字段
    df = df.rename(columns=COLUMN_MAP)

    # 转为记录
    records = df.to_dict(orient="records")

    # 按生产厂商重排序号
    records = renumber_by_manufacturer(records)

    # 输出 JSON
    OUT_PATH.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"saved to {OUT_PATH} ({len(records)} rows)")
    print("preview (first 3 rows):")
    for item in records[:3]:
        print(item)


if __name__ == "__main__":
    main()

