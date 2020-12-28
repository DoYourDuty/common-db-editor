import { logging } from 'protractor';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql } from 'apollo-angular';
import { AgGridAngular } from 'ag-grid-angular';
import 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { ReactiveFormConfig } from '@rxweb/reactive-form-validators';
import { of } from 'rxjs';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { RxTranslation, TranslationCore } from '@rxweb/translate';
import { DynamicCompleteComponent } from './dynamic-complete/dynamic-complete.component';
import { analyzeFile } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  editType: any;
  title = 'my-app';
  public obj = { success1: '1', test2: '2', test3: '3' };
  CurrentSelectedData: any;
  @ViewChild('agGrid') agGrid: AgGridAngular | undefined;
  @ViewChild('appDynamicCompleteUpdate', { static: true })
  appDynamicCompleteUpdate: DynamicCompleteComponent;

  @ViewChild('appDynamicCompleteAdd', { static: true })
  appDynamicCompleteAdd: DynamicCompleteComponent;
  //, {static: false, read: DynamicCompleteComponent}
  defaultColDef = {
    flex: 1,
    minWidth: 200,
    resizable: true,
    // floatingFilter: true,
    menuTabs: ['filterMenuTab'],
    // editable: true,
    sortable: true,
    filter: true,
  };
  // valueSetter: quantityValueSetter

  //checkboxSelection: true
  columnDefs = [

    {
      field: 'aggridid',
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
    },
    { field: 'address' },
    { field: 'city' },
    { field: 'companyName' },
    { field: 'contactName' },
    { field: 'contactTitle' },
    { field: 'country' },
    { field: 'customerId' },
    { field: 'fax' },
    { field: 'postalCode' },
    { field: 'region' },
    {
      field: 'aggridstatus',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Edit', 'Delete'],
      },
    },
    // { field: 'price'}
  ];

  rowClassRules = {
    'sick-days-warning': function (params: any) {
      var aggridstatus = params.data.aggridstatus;
      return aggridstatus === 'Edit';
    },
    'sick-days-breach': 'data.aggridstatus === "Delete"',
    'sick-days-add': 'data.aggridstatus === "Add"',
  };

  autoGroupColumnDef = {
    headerName: 'country',
    field: 'country',
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      checkbox: true,
      rowSelection: 'multiple',
    },
  };
  //,rowGroup: true

  rowData: any;

  rates: any[] | undefined;
  loading = true;
  error: any;

  // currentDataChangeList: changeList[] = [];

  private gridApi: any;
  private gridColumnApi: any;
  undoRedoCellEditingLimit: any;
  rowHeight: any;

  constructor(private http: HttpClient, private apollo: Apollo) {
    // this.editType = 'fullRow';
    this.undoRedoCellEditingLimit = 100;
    this.rowHeight = 35;
    // this.getRowData = this.getRowData.bind(this);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onBtStopEditing() {
    this.gridApi.stopEditing();
  }

  UpdateData(){
    var id = this.appDynamicCompleteUpdate.serverData.find(item => item.name =="aggridid").value;
    // console.log(id);
    let updateItem = (<any[]>this.rowData).find(item => item.aggridid ==  id);

    for(var val in updateItem)
    {
      updateItem[val] = this.appDynamicCompleteUpdate.serverData.find(item => item.name == val).value
      if(val=="aggridstatus" && updateItem[val] == "")
      {
        updateItem[val] = "Edit";
      }
      console.log(updateItem[val] );
    }
    var transaction = { update: [updateItem] };
    console.log('updating - after', updateItem);
    this.gridApi.applyTransaction(transaction);

    // this.gridApi.applyTransaction({ update: this.gridApi.getSelectedRows()});
  }

  AddData(){
    let id =   Math.max.apply(Math, (<any[]>this.rowData).map(function(o) { return o.aggridid; }));
    let updateItem = this.deepCopy((<any[]>this.rowData).find(item => item.aggridid ==  id));

    console.log(updateItem);
    for(var val in updateItem)
    {
      if(val == "aggridid")
      {
        updateItem[val] = id+1;
      }else if(val=="aggridstatus")
      {
        updateItem[val] = "Add";
      }
      else{
        updateItem[val] = this.appDynamicCompleteAdd.serverData.find(item => item.name == val).value
      }
      console.log(updateItem[val]);
    }
    this.rowData.push(updateItem);
    var transaction = { add: [updateItem] };
    console.log('adding', updateItem);
    this.gridApi.applyTransaction(transaction);
  }

  onRemoveSelected() {
    var selectedRowData = this.gridApi.getSelectedRows();
    var self = this;
    selectedRowData.forEach(function (value: any) {
      if(value.aggridstatus === 'Add'){
        self.gridApi.applyTransaction({ remove: [value] });
      }
      else
      {
        value.aggridstatus = value.aggridstatus === 'Delete' ? 'Edit' : 'Delete';
        self.gridApi.applyTransaction({ update: [value] });
      }
      // console.log(value.aggridstatus);
    });
    //console.log(selectedRowData.length);

    //this.gridApi.updateRowData({ update: selectedRowData });
    // var params = {
    //   force: false,
    //   suppressFlash: false,
    // };
    // this.gridApi.refreshCells(params);
  }

  onEditRow(event: any) {
    //event.data.aggridstatus = "Edit";
    console.log(event);
  }

  onBtStartEditing() {
    this.gridApi.setFocusedCell(2, 'country');
    this.gridApi.startEditingCell({
      rowIndex: 2,
      colKey: 'country',
    });
  }

  ngAfterViewInit() {}
  ngOnInit() {
    //   this.http.post<data>('http://localhost:5827/graphql/', '{"query": "{\n  regions {\n    regionDescription\n    regionId\n  }\n}\n","variables": {}}').subscribe({
    //   next: albums =>{
    //     this.rowData=albums.regions
    //   }
    // });

    this.apollo
      .watchQuery({
        query: gql`
          query {
            customers {
              postalCode
              region
              address
              city
              companyName
              contactName
              contactTitle
              country
              customerId
              fax
              phone
            }
          }
        `,
      })
      .valueChanges.subscribe((result: any) => {
        this.rowData = this.deepCopy(result?.data?.customers);
        let num = 1;
        this.rowData.forEach(function (value: any) {
          value.aggridstatus = '';
          value.aggridid = num++;
          delete value.__typename;
          // console.log(value);
        });
        console.log(this.rowData[0]);
        this.appDynamicCompleteUpdate.obj = this.rowData[0];
        this.appDynamicCompleteUpdate.updateDataStart();
        this.appDynamicCompleteAdd.obj = this.rowData[0];
        this.appDynamicCompleteAdd.updateDataStart();
        this.loading = result.loading;
        this.error = result.error;
      });

    //   console.log(this.rowData);
    // this.rowData = this.getRowData();
    //   console.log(this.rowData);
    function myRowClickedHandler(event: any) {
      // console.log('The row was clicked');
    }

    var myGrid = document.querySelector('#myGrid');
    //this.gridApi.resetRowHeights();
  }

  deepCopy(obj: any) {
    var copy: any;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.deepCopy(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  // getRowData() {
  //   var rowDataLocal : any;
  //   rowDataLocal = {...this.rowData};
  //   return rowDataLocal;
  // }

  onCellClicked(event: any) {
    // console.log(event);
  }

  onSelectionChanged(event: any) {


    this.CurrentSelectedData = this.gridApi.getSelectedRows();

    var selectedRows = this.deepCopy(this.gridApi.getSelectedRows());
    var da = selectedRows.length === 1 ? selectedRows[0] : {};
    delete da.__typename;
    this.appDynamicCompleteUpdate.obj = da;
    this.appDynamicCompleteUpdate.updateData();
  }

  getSelectedRows() {
    const selectedNodes = this.agGrid?.api.getSelectedNodes();
    const selectedData = selectedNodes?.map((node) => node.data);

    const selectedDataStringPresentation = selectedData
      ?.map((node) => node.customerId + ' ' + node.companyName)
      .join(', ');

    alert(`Selected nodes: ${selectedDataStringPresentation}`);
  }

  getRowHeight(params: any) {
    return 35;
  }
}

function quantityValueSetter(params: any): any {
  // console.log(params);
  params.data.city = params.newValue;
}

// export interface data {
//   regions: region[];
// }

// export interface region {
//   regionDescription: string;
//   regionId: number;
// }

export interface changeList {
  id: string;
  status: string;
}
