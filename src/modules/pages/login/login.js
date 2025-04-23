import { LightningElement } from 'lwc';
const BACKEND_URL = "https://expense-manager-backend-45o6.onrender.com"||"http://localhost:3002"

export default class Login extends LightningElement {
    handleLoginClick() {
        console.log('Login button clicked!');
        window.location.href = this.loginUrl;
    }

    get loginUrl(){
        return `${BACKEND_URL}/oauth2/login`
    }
}