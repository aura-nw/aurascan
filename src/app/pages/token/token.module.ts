import { NgModule } from '@angular/core';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { TokenRoutingModule } from './token-routing.module';
import { TokenComponent } from './token.component';

@NgModule({
  declarations: [TokenComponent],
  imports: [TokenRoutingModule, TableNoDataModule],
  providers: [],
})
export class TokenModule {}
