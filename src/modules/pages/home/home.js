import { LightningElement } from 'lwc';
import LightningConfirm from 'lightning/confirm';
import { categoryList } from './categoryList';

const BACKEND_URL = "https://expense-manager-backend-45o6.onrender.com"||"http://localhost:3002";
const ADD_ACTION = 'ADD';
const EDIT_ACTION = 'EDIT';

export default class Home extends LightningElement {
    backendUrl = BACKEND_URL;
    expenseRecords = [];
    categoryTableData = [];
    chartData;
    showModal = false;
    formData = {};
    action;
    loggedInUser;
    showSpinner = true; // Unified spinner

    get categoryOptions() {
        return categoryList;
    }

    get modalActionLabel() {
        return this.action === EDIT_ACTION ? 'Edit Expense' : 'Add Expense';
    }

    async connectedCallback() {
        try {
            const user = await this.getLoggedInUser();
            if (!user.user_id) {
                window.location.href = '/login';
            } else {
                this.loggedInUser = user;
                await this.loadAllData();
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            this.showSpinner = false;
        }
    }

    async loadAllData() {
        const expenses = await this.getExpenses();
        this.expenseRecords = expenses.totalSize > 0 ? expenses.records : [];
        this.createChartData();
    }

    async getLoggedInUser() {
        const url = `${BACKEND_URL}/oauth2/whoami`;
        return await this.makeApiRequest(url);
    }

    async getExpenses() {
        const url = `${BACKEND_URL}/expenses`;
        return await this.makeApiRequest(url);
    }

    async makeApiRequest(url, method = 'GET', data = null) {
        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: data ? JSON.stringify(data) : null
        };
        const response = await fetch(url, requestOptions);
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
    }

    editHandler(event) {
        this.action = EDIT_ACTION;
        this.showModal = true;
        this.formData = { ...event.detail };
    }

    deleteHandler(event) {
        const url = `${BACKEND_URL}/expenses/${event.detail.Id}`;
        this.handleConfirmClick(url);
    }

    async handleConfirmClick(url) {
        const result = await LightningConfirm.open({
            message: 'Are you sure you want to delete?',
            variant: 'header',
            label: 'Confirmation',
            theme: 'error'
        });
        if (result) {
            const response = await this.makeApiRequest(url, 'DELETE');
            if (response.id) {
                this.showSpinner = true;
                await this.loadAllData();
                this.showSpinner = false;
            }
        }
    }

    createChartData() {
        const categorySums = {};
        this.expenseRecords.forEach(item => {
            const { Amount__c, Category__c } = item;
            categorySums[Category__c] = (categorySums[Category__c] || 0) + Amount__c;
        });
        this.categoryTableData = Object.keys(categorySums).map((item, index) => ({
            id: index + 1,
            category: item,
            amount: this.formatCurrency(categorySums[item])
        }));
        this.chartData = {
            labels: Object.keys(categorySums),
            results: Object.values(categorySums)
        };
    }

    formatCurrency(number) {
        return number.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    }

    cancelHandler() {
        this.showModal = false;
        this.action = null;
    }

    saveHandler() {
        if (this.isFormValid()) {
            const url = this.formData.Id
                ? `${BACKEND_URL}/expenses/${this.formData.Id}`
                : `${BACKEND_URL}/expenses`;
            const method = this.formData.Id ? 'PUT' : 'POST';
            this.submitExpense(url, method);
        }
    }

    async submitExpense(url, method) {
        this.showSpinner = true;
        const response = await this.makeApiRequest(url, method, this.formData);
        if (response.id) {
            await this.loadAllData();
            this.showModal = false;
            this.action = null;
        }
        this.showSpinner = false;
    }

    addExpense() {
        this.showModal = true;
        this.formData = {};
        this.action = ADD_ACTION;
    }

    changeHandler(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
    }

    isFormValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
}
