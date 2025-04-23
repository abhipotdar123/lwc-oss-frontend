import { LightningElement } from 'lwc';
const SERVER_URL = "http://localhost:3002"

export default class Login extends LightningElement {
    handleLoginClick() {
        console.log('Login button clicked!');
        window.location.href = this.loginUrl;
    }

    get loginUrl(){
        return `${SERVER_URL}/oauth2/login`
    }
}