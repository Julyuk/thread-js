import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { it, describe, expect, beforeAll } from '@jest/globals';
import { faker } from '@faker-js/faker';
import FormData from 'form-data';
import fs from 'fs';
import { config } from '../../../src/libs/packages/config/config.js';
import {
  ApiPath,
  HttpCode,
  HttpMethod,
  AuthApiPath,
  ImagesApiPath,
  UserPayloadKey,
  ImagePayloadKey
} from '../../../src/libs/enums/enums.js';
import {
  joinPath,
  normalizeTrailingSlash
} from '../../../src/libs/helpers/helpers.js';
import { buildApp } from '../../helpers/helpers.js';

describe(`${normalizeTrailingSlash(
  joinPath(config.ENV.APP.API_PATH, ApiPath.IMAGES)
)} routes`, () => {
  const app = buildApp();
  let token;

  beforeAll(async () => {
    const testUser = {
      [UserPayloadKey.USERNAME]: faker.name.firstName(),
      [UserPayloadKey.EMAIL]: faker.internet.email(),
      [UserPayloadKey.PASSWORD]: faker.internet.password()
    };

    const registerResponse = await app
      .inject()
      .post(`${config.ENV.APP.API_PATH}${ApiPath.AUTH}${AuthApiPath.REGISTER}`)
      .body(testUser);

    token = registerResponse.json().token;
  });

  const imagesEndpoint = normalizeTrailingSlash(
    joinPath(config.ENV.APP.API_PATH, ApiPath.IMAGES, ImagesApiPath.ROOT)
  );

  describe(`${imagesEndpoint} (${HttpMethod.POST}) endpoint`, () => {
    it(`should return ${HttpCode.OK} with uploaded image`, async () => {
      const formData = new FormData();

      formData.append(
        ImagePayloadKey.IMAGE,
        fs.createReadStream(
          join(
            fileURLToPath(import.meta.url),
            '../../../data/images/test-image.png'
          )
        )
      );

      const response = await app
        .inject()
        .post(imagesEndpoint)
        .headers({ authorization: `Bearer ${token}`, ...formData.getHeaders() })
        .body(formData);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.json()).toHaveProperty('id');
      expect(response.json()).toHaveProperty('link');
      expect(response.json()).toHaveProperty('createdAt');
      expect(response.json()).toHaveProperty('updatedAt');
    });
  });
});
