import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../session.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {ajax} from 'rxjs/ajax';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.sass']
})
export class AddTaskComponent implements OnInit {

  taskForm: FormGroup;
  constructor(private sessionService: SessionService) {
    this.taskForm = new FormGroup({
      project: new FormControl('', Validators.required),
      task: new FormControl('', Validators.required),
      isParenttask:  new FormControl(''),
      parentTask: new FormControl('', Validators.required),
      startDate: new FormControl(''),
      endDate: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      user: new FormControl('', Validators.required)
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
    this.sessionService.addTask(this.taskForm.value);
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
      map(response => response.response)
    )

  projectFormatter = (result: any) => result.project;

  parentTaskSearch = (text$: Observable<string>) =>
    text$.pipe(
      filter(text => text.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => ajax('./assets/projects.json')),
      map(response => response.response)
    )

  parentTaskFormatter =  (result: any) => result.project;

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
