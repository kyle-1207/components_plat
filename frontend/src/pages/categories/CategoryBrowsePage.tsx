import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 将任意路径映射到顶级分类名称（与 ComponentSearch.tsx 中映射保持一致）
const topLevelCategoryMap: Record<string, string> = {
  'resistors': 'Resistors',
  'capacitors': 'Capacitors',
  'connectors': 'Connectors',
  'crystals-and-oscillators': 'Crystals and Oscillators',
  'crystals & oscillators': 'Crystals and Oscillators',
  'switches': 'Switches',
  'discretes': 'Discretes',
  'thermistors': 'Thermistors',
  'microcircuits': 'Microcircuits',
  'cable-assemblies': 'Cable Assemblies',
  'inductors': 'Inductors',
  'relays': 'Relays',
  'transformers': 'Transformers',
  'filters': 'Filters',
  'wires-and-cables': 'Wires and Cables',
  'wires & cables': 'Wires and Cables',
  'rf-passive-components': 'RF Passive Components',
  'rf passive components': 'RF Passive Components',
  // 中文到英文顶级映射
  '电阻器': 'Resistors',
  '电容器': 'Capacitors',
  '连接器': 'Connectors',
  '晶振与振荡器': 'Crystals and Oscillators',
  '开关': 'Switches',
  '分立器件': 'Discretes',
  '热敏电阻': 'Thermistors',
  '微电路': 'Microcircuits',
  '电缆组件': 'Cable Assemblies',
  '电感器': 'Inductors',
  '继电器': 'Relays',
  '变压器': 'Transformers',
  '滤波器': 'Filters',
  '电线电缆': 'Wires and Cables',
  '射频无源器件': 'RF Passive Components',
};

const normalize = (s: string) =>
  decodeURIComponent(s).trim().toLowerCase();

const CategoryBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    // params.path may be undefined or contain nested paths like "resistors/arrays"
    const rawPath = (params['*'] as string) || '';
    const firstSegment = normalize(rawPath.split('/')[0] || '');

    const mapped = topLevelCategoryMap[firstSegment] || topLevelCategoryMap[rawPath] || '';

    if (mapped) {
      navigate(`/components/search?category=${encodeURIComponent(mapped)}`, { replace: true });
    } else {
      // 无法识别则进入通用搜索页
      navigate('/components/search', { replace: true });
    }
  }, [navigate, params]);

  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>
      正在为您跳转到对应分类...
    </div>
  );
};

export default CategoryBrowsePage;

