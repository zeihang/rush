import { Injectable, Logger } from '@nestjs/common';
import { LoginService } from './login.service';
import { ProductService } from './product.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    private readonly loginService: LoginService,
    private readonly productService: ProductService,
  ) {}

  /**
   *
   * 主流程
   * @memberof AppService
   */
  async main() {
    await this.loginService.init();
    await this.productService.getProduct();
    const path = await this.productService.getSeckillUrl();
    console.log(path, 'path');
    const newpath = this.productService.resolvePath(path);
    this.logger.log(`抢购链接为${newpath}`);
    const res = await this.productService.goToKillUrl(newpath);
    console.log(res.data, 'newpath数据');
    this.loginService.cookieStore(res.headers);
    //后面2步就是订单结算和抢购结果 暂未测试
    const checkRes = await this.productService.toCheckOut();
    console.log(checkRes.data, 'checkres结果');
    this.loginService.cookieStore(checkRes.headers);
    const info = await this.productService.killInfo();
    console.log(info.data, 'info信息');
    const jsondata = JSON.parse(info.data);
    this.loginService.cookieStore(info.headers);
    const final = await this.productService.submitOrder(jsondata);
    console.log(final.data, '抢购结果');
    const result = JSON.parse(final.data);
    if (result.success) {
      this.logger.log(`抢购成功，电脑付款链接:https:${result.pcUrl}`);
    }
    return;
  }
}
