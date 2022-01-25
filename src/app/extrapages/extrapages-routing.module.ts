import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ComingsoonComponent } from './comingsoon/comingsoon.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';

const routes: Routes = [
    {
        path: 'maintenance',
        component: MaintenanceComponent
    },
    {
        path: 'coming-soon',
        component: ComingsoonComponent
    },
    {
        path: '404',
        component: Page404Component
    },
    {
        path: '500',
        component: Page500Component
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ExtrapagesRoutingModule { }
