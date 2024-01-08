import { Injectable } from '@nestjs/common';
import { UpdateFileManageDto } from './dto/update-file-manage.dto';
import { Files } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { del, list, put } from '@vercel/blob';
import qiniu from 'qiniu';
import process from 'process';

@Injectable()
export class FileManageService {
  private readonly mac: qiniu.auth.digest.Mac;
  private bucketManager: qiniu.rs.BucketManager;
  constructor(@InjectRepository(Files) private files: Repository<Files>) {
    this.mac = new qiniu.auth.digest.Mac(
      process.env.QINIU_ACCESSKEY,
      process.env.QINIU_SECRETKEY,
    );
    const config = new qiniu.conf.Config();
    config['zone'] = qiniu.zone.Zone_z0;
    config['useHttpsDomain'] = true;

    this.bucketManager = new qiniu.rs.BucketManager(this.mac, config);
  }

  /**
   * 查找所有文件
   */
  findAllVercelFiles() {
    return this.files.find({
      where: { id: Not('ead9805f-1943-47b6-a2f1-5c101ec1b29e') },
    });
  }

  /**
   * 通过id查找单个文件
   * @param id
   */
  async findOneVercelFile(id: string) {
    return await this.files.findOne({ where: { id } });
  }

  /**
   * 通过id修改单个文件描述信息
   * @param id
   * @param updateFileManageDto
   */
  async updateVercelFile(id: string, updateFileManageDto: UpdateFileManageDto) {
    return await this.files.update(id, updateFileManageDto);
  }

  /**
   * 删除单个文件
   * @param id
   */
  async removeVercelFile(id: string) {
    const file = await this.files.findOne({ where: { id } });
    await this.deleteOneBlob(file.fileUrl);
    return await this.files.delete(id);
  }

  async deleteOneBlob(url: string) {
    return del(url);
  }

  async getAllBlob() {
    const { blobs } = await list();
    return blobs;
  }

  async clearAllBlob(): Promise<void> {
    const result: any = await list();
    const blobs = result && result.blobs;
    if (blobs && Array.isArray(blobs)) {
      await Promise.all(blobs.map((blobUrl) => del(blobUrl.url)));
    }
  }

  async uploadToVercelBlob(filename: string, content: Buffer): Promise<string> {
    const { url } = await put(filename, content, { access: 'public' });
    return url;
  }

  async storeFiles(url: string, name: string, size: number) {
    const files = new Files();
    files.fileName = name;
    files.fileUrl = url;
    files.fileSize = this.convertFileSize(size);
    files.fileType = name.split('.')[1];
    return this.files.save(files);
  }

  convertFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getQiniuUploadToken() {
    const options = {
      scope: 'lshbosheth',
      expires: 7200,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(this.mac);
  }

  findAllQiniuFile() {
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

  removeQiniuFile(key: string) {
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
