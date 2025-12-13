import { RuleEvaluationContext } from '../services/AlertRuleEngine';

export const sampleAlertContexts: RuleEvaluationContext[] = [
  {
    sourceIssueId: 'SAMPLE-ISSUE-001',
    title: '钽电容器高温失效率异常',
    issueSummary: '航天型号批次在 125℃ 条件下失效率攀升至 7%，需关注供应链批次一致性。',
    category: 'environmental',
    manufacturer: 'AVX',
    processTags: ['problem_analysis', 'root_cause_analysis'],
    materialTags: ['tantalum'],
    structureTags: ['capacitor'],
    functionTags: ['power'],
    relatedObjects: {
      components: ['TCN12345'],
      batches: ['BATCH-2024-01'],
      suppliers: ['AVX'],
      projects: ['Satellite-A'],
    },
    metrics: {
      affectedBatches: 3,
      affectedUnits: 250,
      defectRate: 7,
      failureTrend: 'increasing',
    },
  },
  {
    sourceIssueId: 'SAMPLE-ISSUE-002',
    title: 'FPGA 低温封装裂纹预警',
    issueSummary: '供应商返修数据显示，在 -55℃ 条件下封装边缘出现裂纹，疑似材料批次问题。',
    category: 'process',
    manufacturer: 'Xilinx',
    processTags: ['corrective_action'],
    materialTags: ['ceramic'],
    structureTags: ['fpga', 'package'],
    functionTags: ['digital'],
    relatedObjects: {
      components: ['XC7A200T'],
      batches: ['LOT-778-02'],
      suppliers: ['Xilinx'],
      projects: ['Launcher-B'],
    },
    metrics: {
      affectedBatches: 1,
      affectedUnits: 40,
      defectRate: 3.5,
      failureTrend: 'stable',
    },
  },
];

