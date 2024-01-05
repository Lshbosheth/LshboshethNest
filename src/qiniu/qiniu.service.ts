import { Injectable } from '@nestjs/common';
import qiniu from 'qiniu';
import * as process from 'process';
@Injectable()
export class QiniuService {
  private readonly mac: qiniu.auth.digest.Mac;
  private bucketManager: qiniu.rs.BucketManager;
  constructor() {
    this.mac = new qiniu.auth.digest.Mac(
      process.env.QINIU_ACCESSKEY,
      process.env.QINIU_SECRETKEY,
    );
    const config = new qiniu.conf.Config();
    config['zone'] = qiniu.zone.Zone_z0;
    config['useHttpsDomain'] = true;

    this.bucketManager = new qiniu.rs.BucketManager(this.mac, config);
  }

  getUploadToken() {
    const options = {
      scope: 'lshbosheth',
      expires: 7200,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(this.mac);
  }

  findAll() {
    return new Promise((resolve, reject) => {
      this.bucketManager.listPrefix(
        'lshbosheth',
        null,
        function (err, respBody, respInfo) {
          if (err) {
            reject(err);
          } else {
            if (respInfo.statusCode == 200) {
              const items = respInfo.data.items;
              const result = items.filter(
                (e: { key: string }) => !e.key.split('/').includes('_log'),
              );
              resolve(result);
            } else {
              resolve(respBody.error);
            }
          }
        },
      );
    });
  }

  remove(key: string) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete('lshbosheth', key, function (err, respBody) {
        if (err) {
          reject(err);
        } else {
          resolve(respBody);
        }
      });
    });
  }
}
