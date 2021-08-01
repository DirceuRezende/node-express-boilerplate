import nodemailer, { TestAccount } from 'nodemailer';
import logger from '../config/logger';

type SentMessageInfo = {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};

const productionEmailConfig = {
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  secure: true,
};

const testEmailConfig = (testAccount: TestAccount) => ({
  host: 'smtp.ethereal.email',
  auth: testAccount,
});

async function createEmailConfig() {
  if (process.env.NODE_ENV === 'production') {
    return productionEmailConfig;
  } else {
    const testAccount = await nodemailer.createTestAccount();
    return testEmailConfig(testAccount);
  }
}

class Email {
  protected emailConfig: SentMessageInfo = {};
  async sendEmail() {
    const emailConfig = await createEmailConfig();
    const transport = nodemailer.createTransport(emailConfig);
    const info = await transport.sendMail(this.emailConfig);

    if (process.env.NODE_ENV !== 'production') {
      logger.info('URL: ' + nodemailer.getTestMessageUrl(info));
    }
  }
}

export class VerificationEmail extends Email {
  constructor(email: string, address: string) {
    super();

    this.emailConfig.from = '"Test E-mail" <noreply@test.com.br>';
    this.emailConfig.to = email;
    this.emailConfig.subject = 'Verification e-mail';
    this.emailConfig.text = `Hello! Verify your e-mail here: ${address}`;
    this.emailConfig.html = `<h1>Hello!</h1> Verify your e-mail here: <a href="${address}">${address}</a>`;
  }
}

export class PasswordResetEmail extends Email {
  constructor(email: string, token: string) {
    super();
    this.emailConfig.from = '"Test E-mail" <noreply@test.com.br>';
    this.emailConfig.to = email;
    this.emailConfig.subject = 'Password Reset';
    this.emailConfig.text = `Hello! You asked to change your password. Use the token below to change your password:\n${token}`;
    this.emailConfig.html = `<h1>Hello!</h1> You asked to change your password. Use the token below to change your password:\n${token}`;
  }
}
