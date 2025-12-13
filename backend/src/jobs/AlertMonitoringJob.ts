import { alertRuleEngine, alertContextBuilder } from '../services';
import { sampleAlertContexts } from '../data/sampleAlertContexts';
import { logger } from '../utils/logger';

interface AlertMonitoringOptions {
  intervalMs?: number;
  zeroingLimit?: number;
}

export class AlertMonitoringJob {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number;
  private zeroingLimit: number;

  constructor(options: AlertMonitoringOptions = {}) {
    this.intervalMs = options.intervalMs ?? 5 * 60 * 1000; // 默认5分钟
    this.zeroingLimit = options.zeroingLimit ?? 50;
  }

  start() {
    if (this.timer) {
      return;
    }
    logger.info(`🚨 启动质量预警监控任务，间隔 ${this.intervalMs / 1000}s`);
    this.timer = setInterval(() => {
      this.run().catch((error) => {
        logger.error('质量预警监控任务执行失败', error);
      });
    }, this.intervalMs);
    // 启动时先运行一次
    this.run().catch((error) => logger.error('初始质量预警扫描失败', error));
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('🛑 质量预警监控任务已停止');
    }
  }

  private async run() {
    // 合并示例上下文 + 质量归零上下文
    const zeroingContexts = await alertContextBuilder.buildFromQualityZeroing({
      limit: this.zeroingLimit,
    });

    const merged = [...sampleAlertContexts, ...zeroingContexts];

    if (merged.length === 0) {
      logger.info('质量预警扫描：无可用上下文，跳过');
      return;
    }

    const uniqueContexts = this.dedupeContexts(merged);

    logger.info(`质量预警扫描：准备评估 ${uniqueContexts.length} 条上下文`);

    const result = await alertRuleEngine.evaluateContexts(uniqueContexts);
    const created = result.filter((item) => item.created).length;

    logger.info(`质量预警扫描完成：新预警 ${created} 条，跳过 ${result.length - created} 条`);
  }

  private dedupeContexts(contexts: typeof sampleAlertContexts) {
    const map = new Map<string, typeof contexts[number]>();
    contexts.forEach((ctx) => {
      if (!map.has(ctx.sourceIssueId)) {
        map.set(ctx.sourceIssueId, ctx);
      }
    });
    return Array.from(map.values());
  }
}

