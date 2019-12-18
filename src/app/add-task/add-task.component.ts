import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../session.service';
import {Observable,of} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap,tap,catchError} from 'rxjs/operators';
import {ajax} from 'rxjs/ajax';

import {NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {NgbCalendar, NgbDate, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.sass']
})
export class AddTaskComponent implements OnInit {

  taskForm: FormGroup;
  showMsg : string = 'N';
  constructor(private sessionService: SessionService, private ngbDateParserFormatter: NgbDateParserFormatter) {
    this.taskForm = new FormGroup({
      project: new FormControl('', Validators.required),
      task: new FormControl('', Validators.required),
      isParenttask:  new FormControl(''),
      parentTask: new FormControl('', Validators.required),
      startDate: new FormControl(''),
      endDate: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      user: new FormControl('', Validators.required),
      project_id: new FormControl('')
    });

  }

  ngOnInit() {
    this.taskForm.get('isParenttask').valueChanges.subscribe(x => {
      if(x){
        this.taskForm.get('priority').disable();
        this.taskForm.get('parentTask').disable();
        this.taskForm.get('startDate').disable();
        this.taskForm.get('endDate').disable();
        this.taskForm.get('user').disable();
      } else {
        this.taskForm.get('priority').enable();
        this.taskForm.get('parentTask').enable();
        this.taskForm.get('startDate').enable();
        this.taskForm.get('endDate').enable();
        this.taskForm.get('user').enable();
      }
      console.log(x);
    });
    const endDateControl = this.taskForm.controls['endDate'];
    const startDateControl = this.taskForm.controls['startDate'];
    const ngbDateParserFormatter = this.ngbDateParserFormatter;
    endDateControl.valueChanges.subscribe(x =>{
      const sDateValue = startDateControl.value;
      if(x && x != "" && new Date(ngbDateParserFormatter.format(x)).getTime() < new Date(ngbDateParserFormatter.format(sDateValue)).getTime()){
        alert("End Date should be greater than Start Date");
        endDateControl.reset();
      }
    });
    startDateControl.valueChanges.subscribe(x=>{
      const eDateValue = endDateControl.value;
      if(x && x != "" && new Date(ngbDateParserFormatter.format(x)).getTime() > new Date(ngbDateParserFormatter.format(eDateValue)).getTime()){
        alert("Start Date should be less than End Date");
        startDateControl.reset();
      }
    });

  }

  add() {
  const task = JSON.parse(JSON.stringify(this.taskForm.value));
      task.endDate = this.ngbDateParserFormatter.format(task.endDate);
      task.startDate = this.ngbDateParserFormatter.format(task.startDate);
      task.project_id = task.project.project_Id;
    this.sessionService.addTask(task).subscribe(x => {
          this.reset();
          this.sessionService.loadParentTaskList();
        });
  }

  reset() {
    this.taskForm.reset();
  }

  projectSearch = (text$: Observable<string>) =>
     text$.pipe(
      //filter(text => text.length > 2),
      debounceTime(200),
      map(term => this.filterProjectSearch(term))
    )


  projectFormatter = (result: any) => result.project;

  parentTaskSearch = (text$: Observable<string>) =>
    text$.pipe(
     // filter(text => text.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.filterParentTaskSearch(term))
    )

  parentTaskFormatter =  (result: any) => {
        if(result){return result.task.task}
      };

  userSearch = (text$: Observable<string>) =>
     text$.pipe(
      filter(text => text.length > 2),
      debounceTime(200),
       map(term => this.filterUserSearch(term))
    )

 filterUserSearch(searchText: string) {
    const users: any [] = this.sessionService.userList;
    return searchText.length < 2 ? []
      : users.filter(v => {
        return (v.firstName.toLowerCase().indexOf(searchText.toLowerCase()) > -1 || v.lastName.toLowerCase().indexOf(searchText.toLowerCase()) > -1)
        &&  (!v.task_id)
      }).slice(0, 10);
  }

 filterProjectSearch(searchText: string) {
    const projects: any [] = this.sessionService.projectList;
    return searchText.length < 2 ? []
      : projects.filter(v => {
        return v.project.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      }).slice(0, 10);
  }

 filterParentTaskSearch(searchText: string) {
    const parentTasks: any [] = this.sessionService.parentTasksList;
    return searchText.length < 2 ? []
      : parentTasks.filter(v => {
        return v.task.task.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      }).slice(0, 10);
  }

 blurHandler(controlName: string) {
    const userControl = this.taskForm.controls[controlName];
    if(userControl.value){
     if((controlName =='user' && !userControl.value.user_Id)
        || (controlName =='parentTask' && !userControl.value.parent_id)
        || (controlName =='project' && !userControl.value.project_Id)) {
          userControl.reset();
       }
    }
  }

  userFormatter =  (result: any) => {
                       if(result) { return result.firstName + ' ' + result.lastName}
                     };

}
