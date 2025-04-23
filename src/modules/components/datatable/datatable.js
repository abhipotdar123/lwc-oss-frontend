import { LightningElement, api } from "lwc";

const ACTIONS = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];

const COLUMNS = [
    {
        label: "Name",
        type: 'text',
        fieldName: 'Expense_Name__c',
        sortable: true,
        hideDefaultActions: true
    },
    {
        label: "Amount",
        type: 'currency',
        fieldName: 'Amount__c',
        sortable: true,
        hideDefaultActions: true,
        cellAttributes: { alignment: 'left' },
        typeAttributes: { currencyCode: 'USD', step: '0.001' }
    },
    {
        label: "Expense Date",
        type: 'date',
        fieldName: 'Date__c',
        sortable: true,
        hideDefaultActions: true
    },
    {
        label: "Category",
        type: 'text',
        fieldName: 'Category__c',
        sortable: true,
        hideDefaultActions: true
    },
    {
        label: "Notes",
        type: 'text',
        fieldName: 'Notes__c',
        sortable: true,
        hideDefaultActions: true
    },
    {
        type: 'action',
        typeAttributes: {
            rowActions: ACTIONS
        }
    }
];

export default class Datatable extends LightningElement {
    _data = [];
    keyField = 'Id';
    columns = COLUMNS;
    searchTerm = ''; // Added searchTerm property
    pageSize = 10;
    currentPage = 1;
    sortedBy;
    sortedDirection = 'asc';

    pageSizeOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '25', value: '25' },
        { label: '50', value: '50' }
    ];

    @api
    set records(result) {
        this._data = [...result];
        this.currentPage = 1; // Reset to first page when data changes
    }
    get records() {
        return this._data;
    }

    get displayedRecords() {
        let filteredData = [...this._data];

        // Apply search filter
        if (this.searchTerm) {
            const searchKey = this.searchTerm.toLowerCase();
            filteredData = filteredData.filter(row =>
                Object.values(row).some(value =>
                    value && value.toString().toLowerCase().includes(searchKey)
                )
            );
        }

        // Apply sorting
        if (this.sortedBy) {
            filteredData.sort((a, b) => {
                let valueA = a[this.sortedBy];
                let valueB = b[this.sortedBy];

                // Handle null/undefined values
                if (valueA == null) return 1;
                if (valueB == null) return -1;

                // Handle date sorting
                if (this.sortedBy === 'Date__c') {
                    valueA = new Date(valueA);
                    valueB = new Date(valueB);
                }

                if (this.sortedDirection === 'asc') {
                    return valueA > valueB ? 1 : -1;
                } else {
                    return valueA < valueB ? 1 : -1;
                }
            });
        }

        // Calculate pagination
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + parseInt(this.pageSize);
        return filteredData.slice(start, end);
    }

    get totalPages() {
        let filteredData = [...this._data];

        // Apply search filter for total pages calculation
        if (this.searchTerm) {
            const searchKey = this.searchTerm.toLowerCase();
            filteredData = filteredData.filter(row =>
                Object.values(row).some(value =>
                    value && value.toString().toLowerCase().includes(searchKey)
                )
            );
        }

        return Math.ceil(filteredData.length / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    handlePreviousPage() {
        if (!this.isFirstPage) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        if (!this.isLastPage) {
            this.currentPage++;
        }
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.value;
        this.currentPage = 1; // Reset to first page when page size changes
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === "edit") {
            const newEvent = new CustomEvent('edit', {
                detail: row
            });
            this.dispatchEvent(newEvent);
        } else if (actionName === "delete") {
            const newEvent = new CustomEvent('delete', {
                detail: row
            });
            this.dispatchEvent(newEvent);
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value; // Update searchTerm
        this.currentPage = 1; // Reset to first page when search term changes
    }
}