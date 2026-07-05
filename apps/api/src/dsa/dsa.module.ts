import { Module } from '@nestjs/common';
import { DsaService } from './dsa.service';
import { DsaController } from './dsa.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Dsa, DsaSchema } from './schemas/dsa.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Dsa.name, schema: DsaSchema }])],
  controllers: [DsaController],
  providers: [DsaService],
})
export class DsaModule {}
