import { BrandService } from '@core-modules/product/brand/brand.service';
import { HasRole } from '@decorator/roles.decorator';
import { BrandCreateDTO } from '@dtos/brand/create-brand.dto';
import { FindBrandById } from '@dtos/brand/find-brand-by-id.dto';
import { FindBrandByName } from '@dtos/brand/find-brand-by-name.dto';
import { GetAllBrandsDTO } from '@dtos/brand/get-all-brand.dto';
import { BrandUpdateDTO } from '@dtos/brand/update-brand.dto';
import { ApiResponse } from '@dtos/response/ApiResponse/ApiResponse';
import { Role } from '@enum/role.enum';
import { CatchEverythingFilter } from '@filter/exception.filter';
import { JwtAuthGuard } from '@guard/jwt-auth.guard';
import { RolesGuard } from '@guard/roles.guard';
import { NotifyMessage } from '@message/notify-message';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Brand } from '@schema-type';

@ApiTags('Brand')
@Controller('brand')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@UseFilters(CatchEverythingFilter)
export class BrandController {
  private readonly logger = new Logger(BrandController.name);
  constructor(private brandSerivce: BrandService) {}

  @Post('adding')
  @HasRole(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Thêm mới thương hiệu (chỉ ADMIN)' })
  @ApiBody({ type: BrandCreateDTO })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Thêm thương hiệu thành công',
  })
  async addingNewBrand(
    @Body() brand: BrandCreateDTO,
  ): Promise<ApiResponse<Brand>> {
    const newBrand: Brand = await this.brandSerivce.insertBrand(brand);
    this.logger.debug(
      `Get brand after insert in controller ${JSON.stringify(newBrand)}`,
    );

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.BRAND_INSERT_SUCCESSFUL,
      data: newBrand,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy tất cả thương hiệu (phân trang, sắp xếp)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Vị trí bắt đầu',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Kiểu sắp xếp (tên cột)',
  })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Lấy danh sách thương hiệu thành công',
  })
  async getAllBrand(
    @Query() brand: GetAllBrandsDTO,
  ): Promise<ApiResponse<Brand[]>> {
    const newBrand: Brand[] = await this.brandSerivce.getAllBrands(brand);
    this.logger.debug(`Get brand in controller ${JSON.stringify(newBrand)}`);

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.GET_BRAND_SUCCESSFUL,
      data: newBrand,
    };
  }

  @Get('id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thương hiệu theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Brand ID' })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Lấy thương hiệu theo ID thành công',
  })
  async getBrandById(
    @Param() brand: FindBrandById,
  ): Promise<ApiResponse<Brand>> {
    const newBrand: Brand = await this.brandSerivce.getBrandsById(brand);
    this.logger.debug(`Get brand in controller ${JSON.stringify(newBrand)}`);

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.GET_BRAND_SUCCESSFUL,
      data: newBrand,
    };
  }

  @Get('name/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tìm kiếm thương hiệu theo tên' })
  @ApiParam({ name: 'name', type: String, description: 'Brand Name' })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Tìm kiếm thương hiệu thành công',
  })
  async findBrandByName(
    @Param() brand: FindBrandByName,
  ): Promise<ApiResponse<Brand[]>> {
    const brands = await this.brandSerivce.findBrandsByName(brand);
    this.logger.debug(`Brands by name":  ${JSON.stringify(brands)}`);

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.GET_BRAND_SUCCESSFUL,
      data: brands,
    };
  }

  @Put('update')
  @HasRole(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thương hiệu (chỉ ADMIN)' })
  @ApiBody({ type: BrandUpdateDTO })
  @ApiOkResponse({
    type: ApiResponse,
    description: 'Cập nhật thương hiệu thành công',
  })
  async updateBrand(
    @Body() brand: BrandUpdateDTO,
  ): Promise<ApiResponse<Brand>> {
    const updatedBrand: Brand = await this.brandSerivce.updateBrand(brand);
    this.logger.debug(`Updated brand: ${JSON.stringify(updatedBrand)}`);

    return {
      statusCode: HttpStatus.OK,
      message: NotifyMessage.GET_BRAND_SUCCESSFUL,
      data: updatedBrand,
    };
  }
}
