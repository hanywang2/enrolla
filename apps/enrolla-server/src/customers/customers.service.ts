import { Injectable } from '@nestjs/common';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/entities/organization.entity';
import { PrismaService } from '../prisma/prisma.service';
import { Customer } from './entities/customer.entity';
import { FeatureValue } from '../feature-instances/entities/feature-value.entity';
import { FeatureInstancesService } from '../feature-instances/feature-instances.service';
import { PackagesService } from '../packages/packages.service';
import {
  getConfigurationFromFeatures,
  mergeConfigurations,
} from '../utils/configuration.utils';

@Injectable()
export class CustomersService {
  constructor(
    private prismaService: PrismaService,
    private organizationsService: OrganizationsService,
    private featureInstancesService: FeatureInstancesService,
    private packagesService: PackagesService
  ) {}

  async create(createCustomerInput: CreateCustomerInput, tenantId: string) {
    let organization: Organization;
    let organizationId = createCustomerInput.organizationId;

    if (createCustomerInput.organizationId == null) {
      organization = await this.organizationsService.create(
        { name: createCustomerInput.name },
        tenantId
      );

      organizationId = organization.id;
    }

    return await this.prismaService.customer.create({
      data: {
        name: createCustomerInput.name,
        organizationId,
        tenantId,
        packageId: createCustomerInput.packageId,
        features: {
          create: createCustomerInput.features.map((feature) => ({
            featureId: feature.featureId,
            value: feature.value,
            tenantId,
          })),
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return await this.prismaService.customer.findMany({
      where: {
        tenantId,
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    return await this.prismaService.customer.findUnique({
      where: {
        id_tenantId: {
          id,
          tenantId,
        },
      },
    });
  }

  async update(
    id: string,
    updateCustomerInput: UpdateCustomerInput,
    tenantId: string
  ) {
    return await this.prismaService.customer.update({
      where: {
        id_tenantId: {
          id,
          tenantId,
        },
      },
      data: {},
    });
  }

  async remove(id: string, tenantId: string) {
    return await this.prismaService.customer.delete({
      where: {
        id_tenantId: {
          id,
          tenantId,
        },
      },
    });
  }

  async getConfiguration(
    customerId: string,
    tenantId: string
  ): Promise<FeatureValue[]> {
    const packageFeatures = await this.featureInstancesService.findByCustomerId(
      customerId,
      tenantId
    );

    return getConfigurationFromFeatures(packageFeatures);
  }

  async getEffectiveConfiguration(customer: Customer, tenantId: string) {
    const customerConfig = await this.getConfiguration(customer.id, tenantId);

    const packageConfig = await this.packagesService.getEffectiveConfiguration(
      customer.packageId,
      tenantId
    );

    return mergeConfigurations(customerConfig, packageConfig);
  }
}
