import * as ejs from 'ejs';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import { createElement, ReactElement } from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { cssAsBinary, ReportOutput } from './utils';
import { FilesService } from 'lib/services';
import { UserContext } from 'lib/middlewares/openapi';
import { ReportInput, ReportType } from 'lib/middlewares/sequelize';

type ReportExtension = 'pdf' | 'html';

// Extracts the report input or output type
type ExtractReportIO<
  T extends ReportType,
  IO extends ReportInput | ReportOutput
> = {
  [K in IO['type']]: Extract<IO, { type: K }>;
}[T];

// Child classes should extend this config based on their own I/O
export type ReportGeneratorBizConfig<T extends ReportType = ReportType> = {
  input: ExtractReportIO<T, ReportInput>;
  output?: ExtractReportIO<T, ReportOutput>;
};

export abstract class ReportGeneratorBiz<T extends ReportGeneratorBizConfig> {
  protected type: T['input']['type'];
  protected tmpLocation: string;
  protected fileService: FilesService;
  protected component: (args: any) => ReactElement;

  public input: T['input'];
  public output?: T['output'];
  public requestDate: Date;

  private renderedHTML?: string;

  constructor(
    config: T,
    tmpLocation: string,
    component: (args: any) => ReactElement
  ) {
    this.input = config.input;
    this.type = config.input.type;
    this.tmpLocation = tmpLocation;
    this.component = component;

    this.fileService = new FilesService();
    this.requestDate = new Date();
  }

  private getLocalPath(extension: ReportExtension) {
    return `${this.tmpLocation}/${this.getReportTitle()}.${extension}`;
  }
  public getLocalPDFPath() {
    return this.getLocalPath('pdf');
  }
  public getLocalHTMLPath() {
    return this.getLocalPath('html');
  }
  private removeLocalFile(extension: ReportExtension) {
    fs.unlinkSync(this.getLocalPath(extension));
  }
  public async removeLocalPDF() {
    return this.removeLocalFile('pdf');
  }
  public async removeLocalHTML() {
    return this.removeLocalFile('html');
  }
  public async removeLocalFiles() {
    await Promise.all([
      await this.removeLocalPDF(),
      await this.removeLocalHTML(),
    ]);
  }

  private async writeToLocalFile(extension: ReportExtension) {
    if (extension === 'html') {
      return this.writeToLocalHTML();
    } else if (extension === 'pdf') {
      return this.writeToLocalPDF();
    }
  }
  public async writeToLocalPDF() {
    if (!this.renderedHTML) {
      this.renderedHTML = await this.render();
    }

    const browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.setContent(this.renderedHTML, { waitUntil: 'networkidle2' });
    await page.pdf({ format: 'letter', path: this.getLocalPDFPath() });
  }
  public async writeToLocalHTML() {
    if (!this.renderedHTML) {
      this.renderedHTML = await this.render();
    }
    fs.writeFileSync(this.getLocalHTMLPath(), this.renderedHTML);
  }
  public async writeToLocalFiles() {
    await this.writeToLocalHTML();
    await this.writeToLocalPDF();
  }

  public async writeToCloud(extension: ReportExtension, user: UserContext) {
    if (!this.renderedHTML) {
      this.renderedHTML = await this.render();
    }
    await this.writeToLocalFile(extension);

    const path = this.getLocalPath(extension);
    const fileName = `${this.getReportTitle()}.${extension}`;
    const stats = fs.statSync(path);

    const file = {
      tenant_id: user.tenant,
      storage: 's3',
      // filename_disk: `${title}.html`,
      filename_download: fileName,
      title: fileName,
      type: 'application/pdf',
      // folder: null,
      uploaded_by: user.id,
      uploaded_on: this.requestDate,
      modified_by: user.id,
      modified_on: this.requestDate,
      // charset: null,
      filesize: stats.size,
      // width: null,
      // height: null,
      // duration: null,
      // embed: null,
      description: `${
        this.type
      } report created on ${this.requestDate.toISOString()}`,
      // location: null,
      // tags: null,
      // metadata: null,
    };
    const fileId = (await this.fileService.uploadOne(
      fs.createReadStream(path),
      file,
      false
    )) as string;

    return fileId;
  }

  public async generate(user: UserContext) {
    const fileId = await this.writeToCloud('pdf', user);
    if (!this.output) {
      throw new Error('unable to calculate output');
    }
    await this.removeLocalPDF();

    return {
      file_id: fileId,
      output: this.output,
      input: this.input,
    };
  }

  /**
   * Renders HTML fragment for report
   */
  async render() {
    if (this.renderedHTML) {
      return this.renderedHTML;
    }

    await this.calculate();
    if (!this.output) {
      throw new Error('unable to calculate output');
    }

    return this.fullRender(
      ReactDOMServer.renderToString(
        createElement(this.component, {
          input: this.input,
          output: this.output,
        })
      )
    );
  }

  /**
   * Takes a child's report fragment and encapsulates with outer sections
   *
   * Provided component should be an HTML string of a React component
   */
  private async fullRender(component: string): Promise<string> {
    const base = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${this.type} Report</title>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
            integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2"
            crossorigin="anonymous"
          >
          <link
            rel="stylesheet"
            href="${cssAsBinary('/templates/reports/report.css')}"
          >
        </head>
        <body>
          <div id="root"><%- component %></div>
        </body>
      </html>
    `;

    const html = ejs.render(base, {
      component,
    });

    this.renderedHTML = html;
    return this.renderedHTML;
  }

  /**
   * Report title to be used for storage.
   */
  abstract getReportTitle(): string;

  /**
   * Generates calculations for reports
   */
  abstract calculate(): Promise<
    ExtractReportIO<T['input']['type'], ReportOutput>
  >;
}
