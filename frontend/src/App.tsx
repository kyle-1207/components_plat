import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';

import HomePage from '@/pages/HomePage';
import ProtectedRoute from '@/components/ProtectedRoute';

// 航天元器件平台页面
import ComponentSearch from '@/pages/components/ComponentSearch';
import DigitalICSearch from '@/pages/components/DigitalICSearch';
import AnalogICSearch from '@/pages/components/AnalogICSearch';
import HybridICSearch from '@/pages/components/HybridICSearch';
import DiscreteSearch from '@/pages/components/DiscreteSearch';
import MicrowaveSearch from '@/pages/components/MicrowaveSearch';
import VacuumSearch from '@/pages/components/VacuumSearch';
import OptoelectronicSearch from '@/pages/components/OptoelectronicSearch';
import ElectromechanicalSearch from '@/pages/components/ElectromechanicalSearch';
import PowerSearch from '@/pages/components/PowerSearch';
import GeneralSearch from '@/pages/components/GeneralSearch';
import MicrosystemsSearch from '@/pages/components/MicrosystemsSearch';
import GlobalSearch from '@/pages/components/GlobalSearch';
import ComponentCompare from '@/pages/components/ComponentCompare';
import SupplierSearch from '@/pages/SupplierSearch';
import StandardQuery from '@/pages/standards/StandardQuery';

import SelectionManagement from '@/pages/SelectionManagement';

// 采购服务模块
import OnlineProcurement from '@/pages/procurement/OnlineProcurement';
import InventoryManagement from '@/pages/procurement/InventoryManagement';
import SupplyChainMonitoring from '@/pages/procurement/SupplyChainMonitoring';

// 应用支持模块
import FunctionalUnits from '@/pages/application/FunctionalUnits';
import DigitalModels from '@/pages/application/DigitalModels';
import QPLManagement from '@/pages/application/QPLManagement';
import CounterfeitDetection from '@/pages/application/CounterfeitDetection';


// 试验检测模块
import RadiationTesting from '@/pages/testing/RadiationTesting';
import RadiationDataPage from '@/pages/components/RadiationDataPage';

// 质量管理模块
import QualityNotifications from '@/pages/quality/QualityNotifications';
import QualityWarnings from '@/pages/quality/QualityWarnings';
import PremiumProducts from '@/pages/quality/PremiumProducts';

import QualityZeroDefect from '@/pages/quality/QualityZeroDefect';
import QualityTraceability from '@/pages/quality/QualityTraceability';

// 标准服务模块
import StandardsDocuments from '@/pages/standards/StandardDocuments';
import StandardComparison from '@/pages/standards/StandardComparison';
import VersionManagement from '@/pages/standards/VersionManagement';

// 工程服务模块
import Sourcing from '@/pages/engineering/Sourcing';
import Testing from '@/pages/engineering/Testing';

// 资料及培训模块
import TechnicalDocuments from '@/pages/documents/TechnicalDocuments';
import TestData from '@/pages/documents/TestData';
import TechnicalNews from '@/pages/documents/TechnicalNews';
import TechnicalTraining from '@/pages/documents/TechnicalTraining';
import PolicyRegulation from '@/pages/documents/PolicyRegulation';

// 工程服务模块 - 新增页面
import SecurityCertification from '@/pages/engineering/SecurityCertification';
import DesignSimulation from '@/pages/engineering/DesignSimulation';

// 试验检测模块 - 新增页面
import ComponentIdentification from '@/pages/test/ComponentIdentification';

import './App.css';
import CategoryBrowsePage from '@/pages/categories/CategoryBrowsePage';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<HomePage />} />
              
              {/* 标准服务 */}
              <Route path="standards/search" element={<StandardQuery />} />
              <Route path="standards/compare" element={<StandardComparison />} />
              <Route path="standards/versions" element={<VersionManagement />} />
              <Route path="standards/analysis" element={<StandardsDocuments />} />
              
              {/* 器件查询服务 */}
              <Route path="components/search" element={<ComponentSearch />} />
              <Route path="components/digital-ic" element={<DigitalICSearch />} />
              <Route path="components/analog-ic" element={<AnalogICSearch />} />
              <Route path="components/hybrid-ic" element={<HybridICSearch />} />
              <Route path="components/discrete" element={<DiscreteSearch />} />
              <Route path="components/microwave" element={<MicrowaveSearch />} />
              <Route path="components/vacuum" element={<VacuumSearch />} />
              <Route path="components/optoelectronic" element={<OptoelectronicSearch />} />
              <Route path="components/electromechanical" element={<ElectromechanicalSearch />} />
              <Route path="components/power" element={<PowerSearch />} />
              <Route path="components/general" element={<GeneralSearch />} />
              <Route path="components/microsystems" element={<MicrosystemsSearch />} />
              <Route path="components/global-search" element={<GlobalSearch />} />
              <Route path="components/compare" element={<ComponentCompare />} />
              <Route path="components/suppliers" element={<SupplierSearch />} />
              <Route path="components/selection" element={<SelectionManagement />} />
              
              {/* 类别浏览重定向 */}
              <Route path="categories/*" element={<CategoryBrowsePage />} />
              
              {/* 采购服务 */}
              <Route path="procurement/sourcing" element={<Sourcing />} />
              <Route path="procurement/online" element={<OnlineProcurement />} />
              <Route path="procurement/inventory" element={<InventoryManagement />} />
              <Route path="procurement/supply-chain" element={<SupplyChainMonitoring />} />
              
              {/* 应用支持 */}
              <Route path="application/units" element={<FunctionalUnits />} />
              <Route path="application/models" element={<DigitalModels />} />
              <Route path="application/simulation" element={<DesignSimulation />} />
              <Route path="application/qpl" element={<QPLManagement />} />
              <Route path="application/counterfeit" element={<CounterfeitDetection />} />
              
              {/* 质量管理 */}
              <Route path="quality/zero-defect" element={<QualityZeroDefect />} />
              <Route path="quality/notification" element={<QualityNotifications />} />
              <Route path="quality/warning" element={<QualityWarnings />} />
              <Route path="quality/premium-products" element={<PremiumProducts />} />
              <Route path="quality/traceability" element={<QualityTraceability />} />
              
              {/* 试验检测 */}
              <Route path="testing/routine" element={<Testing />} />
              <Route path="testing/qualification" element={<ComponentIdentification />} />
              <Route path="testing/radiation" element={<RadiationTesting />} />
              <Route path="testing/supply-security" element={<SecurityCertification />} />
              
              {/* 辐照数据查询 */}
              <Route path="components/radiation-data" element={<RadiationDataPage />} />
              
              {/* 资料及培训 */}
              <Route path="documents/technical" element={<TechnicalDocuments />} />
              <Route path="documents/test-data" element={<TestData />} />
              <Route path="documents/news" element={<TechnicalNews />} />
              <Route path="documents/training" element={<TechnicalTraining />} />
              <Route path="documents/policy" element={<PolicyRegulation />} />
              
              {/* 其他页面待实现 */}
              <Route path="*" element={<div style={{padding: 24}}>页面开发中...</div>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
