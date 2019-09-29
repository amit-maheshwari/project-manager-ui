import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../session.service';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap} from 'rxjs/operators';
import {compare, NgbdSortableHeader, SortEvent} from '../sortable.directive';
import {ajax} from 'rxjs/ajax';
import {NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {NgbCalendar, NgbDate, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.sass']
})
export class AddProjectComponent implements OnInit {

  projectForm: FormGroup;
  filter: FormControl;
  filteredProjects: any[];
  projectList: any[];
  userList: any[];
  searching: boolean = false;
  completedTask:any;
  totalTask:any;
  managerId:any;
  projectId:any;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(private sessionService: SessionService, private ngbDateParserFormatter: NgbDateParserFormatter) {
    this.projectForm = new FormGroup({
      project: new FormControl('', Validators.required),
      startDate: new FormControl(''),
      endDate: new FormControl('', Validators.required),
      priority: new FormControl('0', Validators.required),
      manager: new FormControl('', Validators.required),
      //completedTask: new FormControl('0'),
      //totalTask: new FormControl('0'),
      startEndDateCheckbox:new FormControl(false),
      //managerId: new FormControl(''),
     // projectId : new FormControl('')
    });

    this.filter = new FormControl('');

    this.filter.valueChanges.subscribe(searchedString => {
      this.filteredProjects = this.filterProjectList(searchedString);
    });
  }

  ngOnInit() {
    this.getProjectList();
    this.sessionService.userList.subscribe(x=>{
      this.userList=x;
    });
    this.projectForm.get('endDate').disable();
    this.projectForm.get('startDate').disable();
    this.projectForm.get('startEndDateCheckbox').valueChanges.subscribe(x => {
          if(x){
            this.projectForm.get('endDate').enable();
            this.projectForm.get('startDate').enable();

          } else {
            this.projectForm.get('endDate').disable();
            this.projectForm.get('startDate').disable();
          }
          console.log(x);
        });
  }

  getProjectList() {
    this.sessionService.getProjectsList().subscribe(x => {
      this.projectList = x;
      this.filteredProjects = this.projectList;
    });
  }


  add() {
    const project = JSON.parse(JSON.stringify(this.projectForm.value));
    project.endDate = this.ngbDateParserFormatter.format(project.endDate);
    project.startDate = this.ngbDateParserFormatter.format(project.startDate);
    project.managerId = project.manager.user_Id;
    this.sessionService.addProject(project).subscribe(x => {
      console.log(x);
    });
    this.getProjectList();
  }

  reset() {
    this.projectForm.reset();
  }

  filterProjectList(text: string): any[] {
    return this.projectList.filter(project => {
      const term = text.toLowerCase();
      return Object.values(project).find(x => {
        return x.toString().toLowerCase().includes(term);
      });
    });
  }

  onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '') {
      this.filteredProjects = this.projectList;
    } else {
      this.filteredProjects = this.projectList.sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  updateProject(selectedProject: any) {
    console.log(selectedProject);
    this.managerId = selectedProject.managerId;
     this.projectId = selectedProject.project_Id;
    this.projectForm.setValue({project: selectedProject.project,
      startDate: this.ngbDateParserFormatter.parse(selectedProject.startDate), endDate: this.ngbDateParserFormatter.parse(selectedProject.endDate)
      , priority: selectedProject.priority, manager: this.sessionService.getUserById(selectedProject.manager),
      startEndDateCheckbox:true,
      });
  }

  deleteProject(projectId:any){
  const that = this;
  this.sessionService.deleteProject(projectId).subscribe(x=>{
        that.getProjectList();
      });
  }

  formatter = (result: any) => result.firstName +' '+result.lastName;

  resultFormatter = (result: any) => result.user_Id;

  type = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(term => term.length <2 ?[]
      :this.userList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) >-1).slice(0,10))
      //tap(() => this.searching = true),
    //  switchMap(term =>
      //  this.sessionService.managerSearch(term).pipe(
        //  tap(() => console.log('')),
          //catchError(() => {
            //return of([]);
          //}))
      //),
      //tap(() => this.searching = false)
    )
}
