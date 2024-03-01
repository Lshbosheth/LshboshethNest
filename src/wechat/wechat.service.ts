import { Injectable } from '@nestjs/common';
import axios from 'axios';
import process from 'process';
import dayjs from 'dayjs';
import CryptoJS, { SHA1 } from 'crypto-js';
@Injectable()
export class WechatService {
  checkSignature(signature: any, timestamp: any, nonce: any): boolean {
    const token = 'NAna0218';
    const tmpArr = [token, timestamp, nonce].sort((a, b) => a.localeCompare(b));
    const tmpStr = tmpArr.join('');
    const hashedStr = SHA1(tmpStr).toString(CryptoJS.enc.Hex);
    return hashedStr === signature;
  }

  async getOpenId(code: string) {
    const appId = process.env.APPID;
    const appSecret = process.env.APPSECRET;
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    try {
      const response = await axios.get(url, {
        params: {
          js_code: code,
          grant_type: 'authorization_code',
          appid: appId,
          secret: appSecret,
        },
      });
      if (response.data) {
        return response.data.openid;
      }
    } catch (error) {
      console.error('Error updating WeChat access token:', error);
    }
  }

  /**
   *获取微信AccessToken
   */
  async getAccessToken() {
    const url = 'https://api.weixin.qq.com/cgi-bin/token';
    try {
      const response = await axios.get(url, {
        params: {
          grant_type: 'client_credential',
          appid: process.env.APPID,
          secret: process.env.APPSECRET,
        },
      });
      if (response.data && response.data.access_token) {
        return response.data.access_token;
      }
    } catch (error) {
      console.error('Error updating WeChat access token:', error);
    }
  }

  /**
   *
   * 微信小程序一次订阅消息推送
   * @param tempId
   * @param msgData
   */
  async pushMsg(tempId: string, msgData: any, openId = '') {
    const token = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`;
    try {
      const response = await axios.post(url, {
        access_token: token,
        template_id: tempId,
        grant_type: 'authorization_code',
        touser: openId || 'oq7pJ5fjlzxMwmWXpTkK8qfBx8mc',
        data: msgData,
        miniprogram_state: 'trial',
        lang: 'zh_CN',
      });
      if (response.data) {
        return response.data;
      }
    } catch (error) {}
  }

  async pushSomeWeatherMsg(openId: string) {
    await this.pushWeatherMsg(openId);
  }

  async pushWeatherMsg(openId = '') {
    const tempId = 'FOhSugSZ11ebVdw0a89HDEJ-kMKFp7DbCcPEgTNzv94';
    const weatherUrl = 'http://t.weather.sojson.com/api/weather/city/101180101';
    const oneUrl = 'https://api.xygeng.cn/one';
    const weatherInfo = await axios.get(weatherUrl);
    const oneInfo = await axios.get(oneUrl);
    const nowWeather = weatherInfo.data.data.forecast[0];
    const msgData = {
      date1: {
        value: dayjs().format('YYYY年MM月DD日'),
      },
      phrase3: {
        value: nowWeather.type,
      },
      character_string14: {
        value: nowWeather.low.split(' ')[1],
      },
      character_string15: {
        value: nowWeather.high.split(' ')[1],
      },
      thing5: {
        value: oneInfo.data.data.content,
      },
    };
    return await this.pushMsg(tempId, msgData, openId);
  }
}
