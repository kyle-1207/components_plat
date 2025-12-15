"""
临时脚本：重新导出国产元器件 JSON，容错匹配列名（温度/辐照/封装等）。
运行后会覆盖 F:\\Business_plat\\domestic_products.json。
用完可删除本文件。
"""

import json
import pathlib
from typing import Dict, List, Optional

import pandas as pd


SRC_PATH = pathlib.Path(r"E:\产品数据\商业航天数据\商业航天产品数据信息表.xlsx")
OUT_PATH = pathlib.Path(r"F:\Business_plat\domestic_products.json")


def find_col(df: pd.DataFrame, preferred: List[str], keywords: List[str]) -> Optional[str]:
    """在 DataFrame 中按优先列名或关键词模糊匹配，返回第一个匹配的列名。"""
    cols = list(df.columns)
    for name in preferred:
        if name in cols:
            return name
    lowered = {c: str(c).lower() for c in cols}
    for kw in keywords:
        for c, lc in lowered.items():
            if kw in lc:
                return c
    return None


def renumber_by_manufacturer(records: List[Dict]) -> List[Dict]:
    """对每个 manufacturer 下的记录，将 seq 从 1 开始递增。"""
    counters: Dict[str, int] = {}
    for rec in records:
        mfr = rec.get("manufacturer", "") or "UNKNOWN"
        counters[mfr] = counters.get(mfr, 0) + 1
        rec["seq"] = counters[mfr]
    return records


def main():
    df = pd.read_excel(SRC_PATH, sheet_name=0)
    print("Columns:", df.columns.tolist())

    col_map = {
        "seq": find_col(df, ["序号"], ["序号"]),
        "level1": find_col(df, ["一级分类"], ["一级"]),
        "level2": find_col(df, ["二级分类"], ["二级"]),
        "level3": find_col(df, ["三级分类"], ["三级"]),
        "name": find_col(df, ["元器件名称"], ["元器件", "名称"]),
        "manufacturer": find_col(df, ["生产厂商"], ["厂商", "生产"]),
        "model": find_col(df, ["规格型号"], ["规格", "型号"]),
        "key_specs": find_col(df, ["关键功能性能指标"], ["关键", "性能", "指标"]),
        "temperature_range": find_col(df, ["工作温度范围（单位：℃）"], ["温度"]),
        "radiation": find_col(df, ["抗辐照指标（单位：kRad. Si）", "抗辐照指标\n（单位：kRad.Si）"], ["辐照", "krad"]),
        "package": find_col(df, ["封装形式"], ["封装"]),
        "quality": find_col(df, ["质量等级"], ["质量"]),
        "price_range": find_col(df, ["参考价格区间"], ["价格"]),
        "lead_time": find_col(df, ["供货周期区间", "货期周期", "供期周期"], ["供货", "货期", "供期"]),
        "space_supply": find_col(df, ["商业航天供货经历", "航天供货"], ["航天"]),
        "is_promoted": find_col(df, ["是否主推产品"], ["主推"]),
        "contact": find_col(df, ["联系人"], ["联系人", "联系"]),
        "material_code": find_col(df, ["材料编号", "材料编码"], ["材料", "物料"]),
    }

    # 打印匹配结果
    print("Column mapping:")
    for k, v in col_map.items():
        print(f"  {k:16s} <- {v}")

    # 为缺失列填空
    for col in col_map.values():
        if col and col not in df.columns:
            df[col] = ""

    # 构造输出 DataFrame
    out_rows = []
    for _, row in df.iterrows():
        rec = {}
        for field, src_col in col_map.items():
            rec[field] = "" if not src_col else (row.get(src_col, "") if pd.notna(row.get(src_col, "")) else "")
        out_rows.append(rec)

    # 按生产厂商重新编号 seq
    out_rows = renumber_by_manufacturer(out_rows)

    # 输出 JSON
    OUT_PATH.write_text(json.dumps(out_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved to {OUT_PATH} ({len(out_rows)} rows)")
    print("preview (first 2 rows):")
    for item in out_rows[:2]:
        print(item)


if __name__ == "__main__":
    main()

