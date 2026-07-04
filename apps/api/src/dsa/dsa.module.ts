import { Module } from '@nestjs/common';
import { DsaService } from './dsa.service';
import { DsaController } from './dsa.controller';

@Module({
  controllers: [DsaController],
  providers: [DsaService],
})
export class DsaModule {}
