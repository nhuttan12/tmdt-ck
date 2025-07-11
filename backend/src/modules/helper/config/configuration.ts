import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { NotAcceptableException } from '@nestjs/common';
import appRootPath from 'app-root-path';
import { ValidationType } from '@interfaces';
import { schema } from '@helper-modules/config/app-config.validation';

/**
 * @description: loading info from yaml file function and return the value after reading the file,
 *  if meeting the error, throw it
 * @var YAML_CONFIG_FILENAME: name of file to load, there two
 *  file to load is config.env.yaml and config.env.yml
 * @var configPath: relative path to the config file
 * @var configObject: info of the file after reading and granting to the variable
 * @var validateObject: use joi to validate the object,
 *  and turn off allowUnknown, cause
 *  not let any field is udefined or empty
 * @var error: error after validate
 * @var value: the value after load and cast in to @ValidationType
 */
const YAML_CONFIG_FILENAME = 'config.env.yaml';
// const YAML_CONFIG_FILENAME = 'config.env.yml';

export default (): ValidationType => {
  const configPath = path.join(appRootPath.path, YAML_CONFIG_FILENAME);
  const configObject = yaml.load(readFileSync(configPath, 'utf8'));
  const validateObject = schema.validate(configObject, { allowUnknown: false });
  const error = validateObject.error;
  const value = validateObject.value as ValidationType;

  if (error) {
    console.log((error as Error).message);
    throw new NotAcceptableException();
  }

  return value;
};
