import * as fs from 'fs';
import * as path from 'path';
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

interface CustomTestCase extends TestCase {
  customStartTime?: Date;
}

export default class CustomHTMLReporter implements Reporter {
  private readonly results: {
    testName: string;
    status: string;
    steps: string[];
    browser: string;
    errorLogs?: string;
    duration: number;
    startTime: string;
    endTime: string;
    videoPath?: string;
    screenshotPath?: string;
    tracePath?: string;
    logs: {
      stdout: string[];
      stderr: string[];
      console: string[];
    };
    textAttachments: {
      name: string;
      body: string;
    }[];
  }[] = [];

  private currentTest?: {
    testName: string;
    steps: string[];
    startTime: Date;
  };

  private formatStep(step: string): string {
    const stepLower = step.toLowerCase();
    if (stepLower.startsWith('Given')) return `🟢 ${step}`;
    if (stepLower.startsWith('When')) return `🟡 ${step}`;
    if (stepLower.startsWith('And')) return `🟠 ${step}`;
    if (stepLower.startsWith('Then')) return `🔴 ${step}`;
    return step;
  }

  private readonly totalStartTime: string = new Date().toLocaleString();
  private totalTime: number = 0;
  private readonly testStartTimes = new Map<CustomTestCase, Date>();
  private currentLogs = {
    stdout: [] as string[],
    stderr: [] as string[],
    console: [] as string[],
  };

  onTestBegin(test: CustomTestCase) {
    this.testStartTimes.set(test, new Date());
    this.currentLogs = {
      stdout: [],
      stderr: [],
      console: [],
    };
  }

  async onStepBegin(test: TestCase, result: TestResult, step: any) {
    if (!this.currentTest) {
      this.currentTest = {
        testName: test.title,
        steps: [],
        startTime: new Date(),
      };
    }

    if (step.title) {
      // Store the formatted step with emoji
      const formattedStep = this.formatStep(step.title);
      this.currentTest.steps.push(formattedStep);
    }
  }

  onStdOut(chunk: string | Buffer) {
    if (chunk) {
      this.currentLogs.stdout.push(chunk.toString());
      // Also echo stdout to the terminal immediately for live visibility
      try {
        process.stdout.write(chunk.toString());
      } catch (e) {
        // ignore
      }
    }
  }

  onStdErr(chunk: string | Buffer) {
    if (chunk) {
      this.currentLogs.stderr.push(chunk.toString());
      // Echo stderr to terminal
      try {
        process.stderr.write(chunk.toString());
      } catch (e) {
        // ignore
      }
    }
  }

  onConsoleMessage(message: { text: string; type: string }) {
    const entry = `${message.type}: ${message.text}`;
    this.currentLogs.console.push(entry);
    // Echo console messages to terminal
    try {
      console.log(`[console ${message.type}] ${message.text}`);
    } catch (e) {
      // ignore
    }
  }

  onTestEnd(test: CustomTestCase, result: TestResult) {
    const startTime = this.testStartTimes.get(test) || new Date();
    const endTime = new Date();

    const videoAttachment = result.attachments.find(
      (att) => att.name === 'video'
    );
    const screenshotAttachment = result.attachments.find(
      (att) => att.name === 'screenshot'
    );
    const traceAttachment = result.attachments.find(
      (att) => att.name === 'trace'
    );

    const videoPath = videoAttachment?.path
      ? this.makeRelativePath(videoAttachment.path)
      : '';
    const screenshotPath = screenshotAttachment?.path
      ? this.makeRelativePath(screenshotAttachment.path)
      : '';
    const tracePath = traceAttachment?.path
      ? this.makeRelativePath(traceAttachment.path, 'traces')
      : '';

    if (traceAttachment?.path) {
      this.copyMediaFile(traceAttachment.path, 'traces');
    }

    const textAttachments = result.attachments
      .filter(
        (attachment) =>
          attachment.contentType === 'text/plain' && attachment.body
      )
      .map((attachment) => ({
        name: attachment.name,
        body: Buffer.isBuffer(attachment.body)
          ? attachment.body.toString('utf-8')
          : String(attachment.body),
      }));

    let browser =
      test.parent?.project()?.use?.browserName ||
      test.parent?.project()?.name ||
      'unknown';

    // Playwright identifies Edge as Chromium internally, so we manually detect Edge
    if (test.parent?.project()?.name === 'edge') {
      browser = 'edge';
    }

    // **Detect if the test is flaky** (retry happened before passing)
    const isFlaky = result.retry > 0 && result.status === 'passed';

    const existingTestIndex = this.results.findIndex(
      (t) => t.testName === test.title && t.browser === browser
    );

    if (existingTestIndex !== -1) {
      if (isFlaky) {
        this.results[existingTestIndex].status = 'flaky';
      }
    } else {
      const errorText = result.error
        ? `${result.error.stack || result.error.message}`
        : undefined;

      this.results.push({
        testName: test.title,
        status: isFlaky ? 'flaky' : result.status,
        steps: result.steps.map((step) => step.title),
        browser,
        errorLogs: errorText,
        duration: result.duration,
        startTime: startTime.toLocaleString(),
        endTime: endTime.toLocaleString(),
        videoPath,
        screenshotPath,
        tracePath,
        logs: { ...this.currentLogs },
        textAttachments,
      });
    }

    if (videoAttachment?.path) {
      this.copyMediaFile(videoAttachment.path, 'videos');
    }
    if (screenshotAttachment?.path) {
      this.copyMediaFile(screenshotAttachment.path, 'screenshots');
    }

    this.totalTime += result.duration;
    this.testStartTimes.delete(test);

    // Echo a concise per-test result to the terminal
    try {
      const status = isFlaky ? 'FLAKY' : result.status.toUpperCase();
      const timeTaken = this.formatDuration(result.duration);
      const browserName = browser || 'unknown';
      const msg = `[${status}] ${test.title} (${browserName}) - ${timeTaken}`;
      if (result.status === 'failed') {
        console.error(msg);
      } else if (isFlaky) {
        console.warn(msg);
      } else {
        console.log(msg);
      }
    } catch (e) {
      // ignore logging errors
    }
  }

  private makeRelativePath(
    filePath: string,
    type?: 'traces' | 'videos' | 'screenshots'
  ): string {
    const fileName = path.basename(filePath);
    const fileType =
      type || (filePath.includes('video') ? 'videos' : 'screenshots');
    return `./assets/${fileType}/${fileName}`;
  }

  private copyMediaFile(
    sourcePath: string,
    type: 'videos' | 'screenshots' | 'traces'
  ) {
    const outputDir = path.resolve('./test-results');
    const assetsDir = path.join(outputDir, 'assets', type);

    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const fileName = path.basename(sourcePath);
    const targetPath = path.join(assetsDir, fileName);

    try {
      fs.copyFileSync(sourcePath, targetPath);
    } catch (error) {
      console.error(`Error copying ${type} file:`, error);
    }
  }

  private formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  private async generatePDFReport() {
    const { chromium } = require('@playwright/test');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const htmlReportPath = path.join(
      process.cwd(),
      'test-results',
      'orangehrm-automation-test-report.html'
    );
    await page.goto(`file:${htmlReportPath}`);
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      document.querySelectorAll('details').forEach((detail) => {
        detail.setAttribute('open', '');
      });

      document.querySelectorAll('tbody tr').forEach((row) => {
        const rowElement = row as HTMLElement;
        rowElement.style.display = '';
      });

      document.querySelectorAll('.copy-button').forEach((button) => {
        button.remove();
      });

      const searchBar = document.querySelector('.search-bar');
      if (searchBar) searchBar.remove();
    });

    await page.waitForTimeout(1000);

    await page.pdf({
      path: path.join(
        process.cwd(),
        'test-results',
        'OrangeHRM Automation Test Report.pdf'
      ),
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
      scale: 0.8,
      preferCSSPageSize: true,
    });

    await browser.close();
  }

  private generateMarkdownReport() {
    const markdown = `# Test Results Summary
  
## Overview
- Total Tests: ${this.results.length}
- Passed: ${this.results.filter((r) => r.status === 'passed').length}
- Failed: ${this.results.filter((r) => r.status === 'failed').length}
- Duration: ${this.formatDuration(this.totalTime)}

## Detailed Results

${this.results
  .map(
    (result) => `
### ${result.testName}
- Status: ${result.status}
- Duration: ${this.formatDuration(result.duration)}
- Start Time: ${result.startTime}
- End Time: ${result.endTime}

${result.steps.map((step) => `- ${step}`).join('\n')}
${result.errorLogs ? `\nError:\n\`\`\`\n${result.errorLogs}\n\`\`\`\n` : ''}
`
  )
  .join('\n')}`;

    fs.writeFileSync(
      path.join(process.cwd(), 'test-results', 'test-report.md'),
      markdown
    );
  }

  async onEnd() {
    const outputDir = path.resolve('./test-results');

    const assetsDir = path.join(outputDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    const outputPath = path.join(
      outputDir,
      'orangehrm-automation-test-report.html'
    );

    const totalTests = this.results.length; // Now only counting unique tests
    const passedTests = this.results.filter(
      (r) => r.status === 'passed'
    ).length;
    const failedTests = this.results.filter(
      (r) => r.status === 'failed'
    ).length;
    const skippedTests = this.results.filter(
      (r) => r.status === 'skipped'
    ).length;
    const flakyTests = this.results.filter((r) => r.status === 'flaky').length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);
    const failRate = ((failedTests / totalTests) * 100).toFixed(2);
    const totalTimeInMinutes = (this.totalTime / 1000 / 60).toFixed(2);
    const endTimeStamp = new Date().toLocaleString();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OrangeHRM Automation Test Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
          }
          .bdd-step {
            font-family: monospace;
            margin: 8px 0;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid #28a745;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            background-color: #007bff;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            cursor: pointer;
          }
          .summary div { font-weight: bold; }
          .search-bar {
            text-align: center;
            margin-bottom: 20px;
          }
          input[type="text"] {
            width: 50%;
            padding: 10px;
            font-size: 16px;
            border-radius: 5px;
            border: 1px solid #ccc;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th { background-color: #28a745; color: white; cursor: pointer; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .passed { color: #28a745; font-weight: bold; }
          .failed { color: #dc3545; font-weight: bold; }
          .skipped { color: #6c757d; font-weight: bold; }
          .flaky { color: #ffc107; font-weight: bold; }
          .steps-box {
            background-color: #f1f1f1;
            padding: 10px;
            margin-top: 10px;
            border-left: 3px solid #007bff;
          }
          .attachments a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
          }
        .log-section {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
          }

          .log-entry {
            font-family: monospace;
            white-space: pre-wrap;
            margin: 4px 0;
            padding: 4px 8px;
            background: #fff;
            border-left: 3px solid #28a745;
          }

          details summary {
            cursor: pointer;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
          }

          .copy-button {
            float: right;
            padding: 2px 6px;
            background: #eee;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
        <script>
          function searchTests() {
            const input = document.getElementById('search').value.toLowerCase();
            document.querySelectorAll('tbody tr').forEach((row) => {
              const match = Array.from(row.cells).some((cell) => cell.textContent.toLowerCase().includes(input));
              row.style.display = match ? '' : 'none';
            });
          }

          function filterStatus(status) {
            document.querySelectorAll('tbody tr').forEach((row) => {
              const statusCell = row.querySelector('.status');
              row.style.display = (status === 'all' || statusCell.textContent.trim() === status) ? '' : 'none';
            });
          }

          function showAll() {
            document.querySelectorAll('tbody tr').forEach((row) => (row.style.display = ''));
          }

          let sortDirection = 1;

          function sortByTime() {
            const tbody = document.querySelector('tbody');
            if (!tbody) return;

            const rows = Array.from(document.querySelectorAll('tbody tr'));
            if (!rows.length) return;

            rows.sort((a, b) => {
              const timeA = a.querySelector('.time-taken')?.textContent ?? '0s';
              const timeB = b.querySelector('.time-taken')?.textContent ?? '0s';
              return (parseDuration(timeA) - parseDuration(timeB)) * sortDirection;
            });

            tbody.innerHTML = '';
            rows.forEach((row) => tbody.appendChild(row));
            sortDirection *= -1;
          }

          function parseDuration(duration) {
            const match = duration.match(/([0-9]+)m[ ]([0-9.]+)s|([0-9.]+)s/);
            
            if (match) {
              if (match[1] && match[2]) {
                return parseInt(match[1], 10) * 60 + parseFloat(match[2]);
              } else if (match[3]) {
                return parseFloat(match[3]);
              }
            }
            return 0;
          }
            function prepareForPrint() {
              document.querySelectorAll('details').forEach(detail => {
                detail.setAttribute('open', '');
              });

              document.querySelectorAll('tbody tr').forEach(row => {
                row.style.display = '';
              });

              document.querySelectorAll('.copy-button').forEach(button => {
                button.style.display = 'none';
              });

              window.print();
            }
        </script>
      </head>
      <body>
        <h1>OrangeHRM Automation Test Results Summary</h1>
        <!-- Print/Save as PDF Button -->
        <button onclick="prepareForPrint()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Print/Save as PDF
        </button>
        <div class="summary">
          <div onclick="filterStatus('all')">All: ${totalTests}</div>
          <div onclick="filterStatus('passed')">Passed: ${passedTests}</div>
          <div onclick="filterStatus('failed')">Failed: ${failedTests}</div>
          <div onclick="filterStatus('skipped')">Skipped: ${skippedTests}</div>
          <div onclick="filterStatus('flaky')">Flaky: ${flakyTests}</div>
          <div>Pass Rate: ${passRate}%</div>
          <div>Fail Rate: ${failRate}%</div>
          <div>Total Time: ${totalTimeInMinutes} min</div>
          <div class="timestamp">Timestamp: ${new Date().toLocaleString()}</div>
          <div onclick="showAll()">Show All</div>
        </div>
        <div class="search-bar">
          <input type="text" id="search" placeholder="Search by any field..." onkeyup="searchTests()">
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Test Name</th>
              <th>Browser</th>
              <th>Status</th>
              <th onclick="sortByTime()">Time Taken &#x2195;</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Attachments</th>
            </tr>
          </thead>
          <tbody> 
            ${this.results
              .map(
                (result, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>
                      <details>
                        <summary>${result.testName}</summary>
                      
                        <!-- BDD Test Steps -->
                        <div class="log-section">
                          <h4>Test Steps</h4>
                          ${result.steps
                            .map(
                              (step) => `
                                <div class="bdd-step">${this.formatStep(
                                  step
                                )}</div>
                              `
                            )
                            .join('')}
                        </div>

                        <!-- Error Logs -->
                        ${
                          result.errorLogs
                            ? `
                          <div class="log-section">
                            <h4>Error</h4>
                            <div class="log-entry" style="border-left-color: #dc3545;">
                              ${result.errorLogs}
                            </div>
                          </div>
                        `
                            : ''
                        }
                        ${
                          (result.logs.stdout.length > 0 || result.logs.stderr.length > 0 || result.logs.console.length > 0)
                            ? `
                          <div class="log-section">
                            <h4>Captured Logs</h4>
                            ${result.logs.stdout.length > 0 ? `<div class="log-entry"><strong>stdout:</strong><br>${result.logs.stdout.join('<br>')}</div>` : ''}
                            ${result.logs.stderr.length > 0 ? `<div class="log-entry"><strong>stderr:</strong><br>${result.logs.stderr.join('<br>')}</div>` : ''}
                            ${result.logs.console.length > 0 ? `<div class="log-entry"><strong>console:</strong><br>${result.logs.console.join('<br>')}</div>` : ''}
                          </div>
                        `
                            : ''
                        }
                      </details>
                    </td>
                    <td>${result.browser}</td> <!-- Added Browser Name Column -->
                    <td class="status ${result.status}">${result.status}</td>
                    <td class="time-taken">${this.formatDuration(
                      result.duration
                    )}</td>
                    <td>${result.startTime}</td>
                    <td>${result.endTime}</td>
                    <td class="attachments">
                      ${
                        result.screenshotPath
                          ? `<a href="${result.screenshotPath}" target="_blank">Screenshot</a>`
                          : ''
                      }
                      ${
                        result.videoPath
                          ? `<a href="${result.videoPath}" target="_blank">Video</a>`
                          : ''
                      }
                      ${
                        result.tracePath
                          ? `<a href="${result.tracePath}" target="_blank">Trace</a>`
                          : ''
                      }
                    </td>
                  </tr>
                `
              )
              .join('')}
</tbody>
        </table>
      </body>
      </html>
    `;

    fs.writeFileSync(outputPath, htmlTemplate);

    try {
      await this.generatePDFReport();
      console.log(
        `PDF report generated at: ${path.join(
          outputDir,
          'OrangeHRM Automation Test Report.pdf'
        )}`
      );
    } catch (error) {
      console.error('Error generating PDF report:', error);
    }

    try {
      this.generateMarkdownReport();
      console.log(
        `Markdown report generated at: ${path.join(
          outputDir,
          'test-report.md'
        )}`
      );
    } catch (error) {
      console.error('Error generating Markdown report:', error);
    }

    console.log(`HTML report generated at ${outputPath}`);
    console.log(`Test Suite Completed At: ${endTimeStamp}`);
    // Print summary to terminal
    try {
      console.log('');
      console.log('===== Test Summary =====');
      console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests} | Skipped: ${skippedTests} | Flaky: ${flakyTests}`);
      console.log(`Pass Rate: ${passRate}% | Fail Rate: ${failRate}% | Total Time: ${totalTimeInMinutes} min`);
      if (failedTests > 0) {
        console.log('\nFailed tests:');
        this.results.filter(r => r.status === 'failed').forEach(r => console.log(`- ${r.testName} (${r.browser})`));
      }
      console.log('========================');
    } catch (e) {
      // ignore
    }
  }
}
