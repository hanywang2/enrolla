import { useList } from '@pankod/refine-core';
import {
  Button,
  Create,
  Group,
  SaveButton,
  Select,
  Stack,
  Stepper,
  TextInput,
  Title,
  Text,
  useSelect,
  useStepsForm,
} from '@pankod/refine-mantine';
import { List } from '@mantine/core';
import { IconEditCircle } from '@tabler/icons';
import { FeatureCustomizeComponent } from '../../components/features/FeatureCustomizeComponent';
import { FeatureViewComponent } from '../../components/features/FeatureViewComponent';
import { ICustomer, IFeature } from '../../interfaces';
import { CustomizedFeature } from '../../interfaces/features.interface';

export const CustomerCreate: React.FC = () => {
  const {
    saveButtonProps,
    getInputProps,
    values,
    setValues,
    steps: { currentStep, gotoStep },
  } = useStepsForm<ICustomer>({
    initialValues: {
      features: [],
      packageId: null,
    },
    validate: {
      name: (value) => {
        if (!value) {
          return 'Name is required';
        }
      },
      organizationId: (value) => {
        if (!value) {
          return 'Organization ID is required';
        }
      },
    },
    validateInputOnBlur: true,
  });

  const { selectProps: selectPackageProps } = useSelect({
    resource: 'packages',
    optionLabel: 'name',
    metaData: {
      fields: ['id', 'name'],
    },
  });

  const { selectProps: selectOrganizationProps } = useSelect({
    resource: 'organizations',
    optionLabel: 'name',
    metaData: {
      fields: ['id', 'name'],
    },
  });

  const { data: featureList } = useList<IFeature>({
    resource: 'features',
    metaData: {
      fields: ['id', 'key', 'defaultValue', 'type', 'description'],
    },
  });

  return (
    <Create
      // Next, previous and save buttons
      footerButtons={
        <Group position="right" mt="xl">
          {currentStep !== 0 && (
            <Button variant="default" onClick={() => gotoStep(currentStep - 1)}>
              Back
            </Button>
          )}
          {currentStep !== 2 && (
            <Button onClick={() => gotoStep(currentStep + 1)}>Next step</Button>
          )}
          {currentStep === 2 && <SaveButton {...saveButtonProps} />}
        </Group>
      }
    >
      <Stepper active={currentStep} breakpoint="sm">
        <Stepper.Step label="Basic Info">
          <TextInput
            mt={8}
            label="Name"
            placeholder="name"
            withAsterisk
            {...getInputProps('name')}
          />
          <Select
            mt={8}
            label="Organization Id"
            placeholder="the internal identifier you use for this customer"
            withAsterisk
            creatable
            {...getInputProps('organizationId')}
            {...selectOrganizationProps}
          />
          <Select
            mt={8}
            label="Package"
            placeholder="Pick one"
            {...getInputProps('packageId')}
            {...selectPackageProps}
          />
        </Stepper.Step>
        <Stepper.Step label="Customize Features">
          <FeatureCustomizeComponent
            customizedFeatures={values['features'] as CustomizedFeature[]}
            onCustomizedFeaturesChange={(newCustomizedFeatures) => {
              setValues({ features: newCustomizedFeatures });
            }}
          />
        </Stepper.Step>
        <Stepper.Step label="Summary">
          <Stack mt={16}>
            <>
              <Title>{values['name'] as string}</Title>
              <Text> {values['description'] as string}</Text>
              <Title mt={8} order={3}>
                Customized Features
              </Title>
              <List center icon={<IconEditCircle size={16} />}>
                {featureList &&
                  (values['features'] as CustomizedFeature[])?.map(
                    (feature) => {
                      const featureMetadata = featureList.data.find(
                        (f) => f.id === feature.featureId
                      );
                      if (!featureMetadata) {
                        return null;
                      }

                      return (
                        <List.Item>
                          <Group>
                            <Text>{featureMetadata.key}:</Text>
                            <FeatureViewComponent
                              type={featureMetadata.type}
                              value={feature.value.value}
                            />
                          </Group>
                        </List.Item>
                      );
                    }
                  )}
              </List>
            </>
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Create>
  );
};
