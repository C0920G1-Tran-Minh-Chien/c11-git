import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [

  {
    path: 'common',
    loadChildren: () => import('./common/common.module').then(module => module.CommonModule)
  },
  {
    path: 'warehouse',
    loadChildren: () => import('./warehouse/warehouse.module').then(module => module.WarehouseModule)
  },
  {
    path: 'management-information',
    loadChildren: () => import('./management-information/management-information.module').then(module => module.ManagementInformationModule)
  },
  {
    path: 'report',
    loadChildren: () => import('./report/report.module').then(module => module.ReportModule)
  },
  {
    path: 'information-lookup',
    loadChildren: () => import('./information-lookup/information-lookup.module').then(module => module.InformationLookupModule)
  }, {
  path : 'manufacturer',
  loadChildren: () => import('./manufacturer/manufacturer.module').then(module => module.ManufacturerModule)
},
  {
    path: 'wholesale',
    loadChildren: () => import('./wholesale/wholesale.module').then(module => module.WholesaleModule)
  },
  {
    path: 'prescription',
    loadChildren: () => import('./prescription-indicative/prescription/prescription.module').then(module => module.PrescriptionModule)
  },
  {
    path: 'indicative',
    loadChildren: () => import('./prescription-indicative/indicative/indicative.module').then(module => module.IndicativeModule)
  },
  {
    path: 'employee',
    loadChildren: () => import('./employee/employee.module').then(module => module.EmployeeModule)
  },
  {
    path: "customer",
    loadChildren: () => import('./management-information/management-information.module').then(module => module.ManagementInformationModule)
  },
  {
    path: "sale-retail",
    loadChildren: () => import('./sale-retail/sale-retail.module').then(module => module.SaleRetailModule)
  },
  {
    path: 'sales',
    loadChildren: () => import('./sales-invoice-management/sales-invoice-management-routing.module').then(module => module.SalesInvoiceManagementRoutingModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
