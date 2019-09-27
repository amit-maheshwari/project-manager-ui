import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../session.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
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

  }

  add() {
  const task = JSON.parse(JSON.stringify(this.taskForm.value));
      task.endDate = this.ngbDateParserFormatter.format(task.endDate);
      task.startDate = this.ngbDateParserFormatter.format(task.startDate);
      task.project_id = task.project.project_id;
    this.sessionService.addTask(task).subscribe(x => {
          this.reset();
        });
  }

  reset() {
    this.taskForm.reset();
  }

  projectSearch = (text$: Observable<string>) =>
     text$.pipe(
      filter(text => text.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => ajax('./assets/projects.json')),
     //switchMap(term => this.sessionService.getProjectsList()),
      map(response => response.response)
    )

  projectFormatter = (result: any) => result.project;

  parentTaskSearch = (text$: Observable<string>) =>
    text$.pipe(
      filter(text => text.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => ajax('./assets/parentTask.json')),
      map(response => response.response)
    )

  parentTaskFormatter =  (result: any) => result.task;

  userSearch = (text$: Observable<string>) =>
     text$.pipe(
      filter(text => text.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => ajax('./assets/manager.json')),
      map(response => response.response)
    )

  userFormatter =  (result: any) => result.firstName;

}
