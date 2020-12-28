import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';

import {
  DynamicFormBuildConfig,
  DynamicFormConfiguration,
  RxDynamicFormBuilder,
} from '@rxweb/reactive-dynamic-forms';
import {
  ReactiveFormConfig,
  ResetFormType,
  RxFormBuilder,
  FormGroupExtension,
} from '@rxweb/reactive-form-validators';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dynamic-complete',
  templateUrl: './dynamic-complete.component.html',
  styleUrls: ['./dynamic-complete.component.scss'],
})
//AfterViewInit
export class DynamicCompleteComponent implements OnInit {
  public serverData = [];
  public obj = {};
  constructor(public formBuilder: RxDynamicFormBuilder) {}

  public ngOnInit() {}

  getSelectedRows() {
    this.serverData.forEach(function (val: any) {
      console.log(val.name + ' - ' + val.value);
    });
  }

  public updateDataStart() {
    let ser = [];
    for (var value1 in this.obj) {
      if (value1 === 'aggridstatus' || value1 === 'aggridid') {
        ser.push({
          name: value1,
          value: '',
          type: 'text',
          disable: true,
          required: true,
        });
      } else {
        ser.push({
          name: value1,
          value: '',
          type: 'text',
          disable: false,
          required: true,
        });
      }
    }
    this.serverData = ser;
  }

  public updateData() {
    let ser = [];
    for (var value1 in this.obj) {
      if (value1 === 'aggridstatus' || value1 === 'aggridid') {
        ser.push({
          name: value1,
          value: this.obj[value1],
          type: 'text',
          disable: true,
          required: true,
        });
      } else {
        ser.push({
          name: value1,
          value: this.obj[value1],
          type: 'text',
          disable: false,
          required: true,
        });
      }
    }
    this.serverData = ser;
  }

  public GetData() {
    // let ser = [];
    // for(var value1 in this.obj) {
    //   ser.push({
    //     name: value1,
    //     value: this.obj[value1],
    //     type: 'text',
    //     required: true
    //   });
    // }
    // this.serverData = ser;
  }
}
