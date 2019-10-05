import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {NgbdSortableHeader, SortEvent, compare} from '../sortable.directive';
import {SessionService} from '../session.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {Observable,of} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, catchError} from 'rxjs/operators';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.sass']
})
export class ViewTaskComponent implements OnInit {

  originalTaskList: any[];
  taskList: any[];
  taskFormArray: FormArray;
  editedRow: number = -1;
  projectFormGroup: FormGroup;
  selectedProjectId: number;
  selectedProjectName: string = '';

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(private sessionService: SessionService, private ngbDateParserFormatter: NgbDateParserFormatter) {
    this.taskFormArray = new FormArray([]);
    this.projectFormGroup = new FormGroup({});
    this.projectFormGroup.addControl('projectSearchControl',  new FormControl(''));
  }

  ngOnInit() {
   // this.getTasksList();
  }

  blurHandler() {
    const searchControl = this.projectFormGroup.controls['projectSearchControl'];
    if(searchControl.value && !searchControl.value.project_Id){
      searchControl.reset();
    }
  }

  search(){
    const search = this.projectFormGroup.value.projectSearchControl;
    if(!search){
      alert('Please select a Project');
    }else{
      this.selectedProjectId = search.project_Id;
      this.selectedProjectName =search.project;
      //console.log(search);
      this.sessionService.searchTask(search.project_Id).
      subscribe(x => {
                     this.taskList = x;
                     this.originalTaskList = x;
                     this.updateFormArray();
                     this.projectFormGroup.controls['projectSearchControl'].reset();
                    });
    }
  }

  getTasksList() {
   this.sessionService.searchTask(this.selectedProjectId).
         subscribe(x => {
                        this.taskList = x;
                        this.originalTaskList = x;
                        this.updateFormArray();
                       // this.projectFormGroup.controls['projectSearchControl'].reset();
                       });
  }

  updateFormArray() {
    let formGroup: FormGroup;
    let formControl: FormControl;
    this.taskFormArray = new FormArray([]);
    this.taskList.forEach( (eachTask, index, array) => {
      formGroup = new FormGroup({});
      this.taskFormArray.push(formGroup);
      Object.keys(eachTask).forEach( key => {
        let value = eachTask[key];
        if(value && value != '' && (key === "startDate" || key =="endDate")){
          value = {day: Number(value.split('-')[2]), month: Number(value.split('-')[1]),
            year: Number(value.split('-')[0])};
        }
        formControl = new FormControl(value);
        formGroup.addControl(key, formControl);
      });
      formGroup['orignalValue'] = formGroup.value;
    });
  }

  getValue(i, controlName) {
    let taskGroup = this.taskFormArray.controls[i];
    if(taskGroup && taskGroup instanceof FormGroup) {
      return taskGroup.controls[controlName].value;
    }
    return 'NA';
  }

  getParentTask(i, controlName) {
    let value = this.getValue(i,controlName);
    if(value){
      return this.parentTaskFormatter(value)
    }
    return value;
  }

  getDateValue(i, controlName) {
    let value = this.getValue(i,controlName);
    if(value && value.year) {
      value = this.ngbDateParserFormatter.format(value);
    }
    return value;
  }

  editTask(i) {
    this.editedRow = i;
  }
  deleteTask(i) {
    this.editedRow=-1;
   // alert("deleted row "+i);
  }

  saveTask(i) {
    this.editedRow=-1;
    let taskGroup = this.taskFormArray.controls[i];
   const task = JSON.parse(JSON.stringify(taskGroup.value));
    task.endDate = this.ngbDateParserFormatter.format(task.endDate);
    task.startDate = this.ngbDateParserFormatter.format(task.startDate);
   // task.project_Id = task.project_id;
    this.sessionService.updateTask(task).
    subscribe(x => {
               this.getTasksList();
              });
  }

  endTask(i) {
      this.editedRow=-1;
      let taskGroup = this.taskFormArray.controls[i];
     const task = JSON.parse(JSON.stringify(taskGroup.value));
      task.endDate = this.ngbDateParserFormatter.format(task.endDate);
      task.startDate = this.ngbDateParserFormatter.format(task.startDate);
      task.status = "Completed";
      this.sessionService.updateTask(task).
      subscribe(x => {
                 this.getTasksList();
                });
    }


  cancel(i, taskGroup){
    this.editedRow = -1;
    taskGroup.reset(taskGroup['orignalValue']);
  }

  isRowEdited(i) {
    return this.editedRow === i ? true: false;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction === '') {
      this.taskList = this.originalTaskList;
    } else {
      this.taskList = [...this.originalTaskList].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
    this.updateFormArray();
  }


  parentTaskSearch = (text$: Observable<string>) =>
      text$.pipe(
       // filter(text => text.length > 2),
        debounceTime(200),
        distinctUntilChanged(),
        map(term => this.filterParentTaskSearch(term))
      )

 filterParentTaskSearch(searchText: string) {
     const parentTasks: any [] = this.sessionService.parentTasksList;
     return searchText.length < 2 ? []
       : parentTasks.filter(v => {
         return v.task.task.toLowerCase().indexOf(searchText.toLowerCase()) > -1
       }).slice(0, 10);
   }

 parentTaskFormatter =  (result: any) => {
     if(result){return result.task.task}
  };

 projectSearch = (text$: Observable<string>) =>
      text$.pipe(
       //filter(text => text.length > 2),
       debounceTime(200),
       map(term => this.filterProjectSearch(term))
     )
 filterProjectSearch(searchText: string) {
    const projects: any [] = this.sessionService.projectList;
    return searchText.length < 2 ? []
      : projects.filter(v => {
        return v.project.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      }).slice(0, 10);
  }

 projectFormatter = (result: any) => result.project;

}
