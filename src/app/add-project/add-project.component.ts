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
  showAdd:boolean = true;

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
    const endDateControl = this.projectForm.get('endDate');
    const startDateControl = this.projectForm.get('startDate');
    const _this = this.ngbDateParserFormatter;
    startDateControl.disable();
    endDateControl.disable();
    endDateControl.valueChanges.subscribe(x=>{
      const sDateValue = startDateControl.value;
      if(x && x != "" && new Date(_this.format(x)).getTime() < new Date(_this.format(sDateValue)).getTime()){
        alert("End Date should be greater than Start Date");
        endDateControl.reset();
      }
    });
    startDateControl.valueChanges.subscribe(x=>{
      const eDateValue = endDateControl.value;
      if(x && x != "" && new Date(_this.format(x)).getTime() > new Date(_this.format(eDateValue)).getTime()){
        alert("Start Date should be less than End Date");
        startDateControl.reset();
      }
    });
    this.projectForm.get('startEndDateCheckbox').valueChanges.subscribe(x => {
      if(x){
        let date = new Date();
        const startDate = this.projectForm.get('startDate')
        startDate.enable();
        startDate.setValue({year: date.getFullYear(), month: date.getMonth() + 1, day: date.getUTCDate()});
        date = new Date(date.setDate(date.getDate() + 1));
        const endDate = this.projectForm.get('endDate')
        endDate.enable();
        endDate.setValue({year: date.getFullYear(), month: date.getMonth() + 1, day: date.getUTCDate()});
      } else {
        this.projectForm.get('endDate').disable();
        this.projectForm.get('startDate').disable();
        this.projectForm.get('endDate').reset();
        this.projectForm.get('startDate').reset();
      }
      console.log(x);
    });
  }

  getProjectList() {
    this.sessionService.getProjectsList().subscribe(x => {
      this.projectList = x;
      this.sessionService.updateProjectList(x);
      this.filteredProjects = this.projectList;
    });
  }


 add() {
     const project = JSON.parse(JSON.stringify(this.projectForm.value));
     project.endDate = this.ngbDateParserFormatter.format(project.endDate);
     project.startDate = this.ngbDateParserFormatter.format(project.startDate);
     project.managerId = project.manager.user_Id;
     this.sessionService.addProject(project).subscribe(x => {
       this.reset();
       this.getProjectList();
     });

   }

  reset() {
    this.projectForm.reset();
    this.showAdd=true;
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
      , priority: selectedProject.priority, manager: selectedProject.manager,
      startEndDateCheckbox:true,
    });
    this.showAdd=false;
  }

 update(){
   const project = JSON.parse(JSON.stringify(this.projectForm.value));
    project.endDate = this.ngbDateParserFormatter.format(project.endDate);
    project.startDate = this.ngbDateParserFormatter.format(project.startDate);
   this.sessionService.updateProject(project, this.projectId).subscribe(x => {
   this.reset();
   this.getProjectList();
   });
 }

  deleteProject(projectId: any) {
  if(confirm("Are you sure to delete the project?")) {
      const that = this;
      this.sessionService.deleteProject(projectId).subscribe(x => {
        that.getProjectList();
      });
    }
  }

  formatter = (result: any) => {
    if(result) { return result.firstName + ' ' + result.lastName}
  };

  type = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(term => this.filterManagerSearch(term))
    )

  filterManagerSearch(searchText: string) {
    const users: any [] = this.sessionService.userList;
    return searchText.length < 2 ? []
      : users.filter(v => {
        return (v.firstName.toLowerCase().indexOf(searchText.toLowerCase()) > -1 || v.lastName.toLowerCase().indexOf(searchText.toLowerCase()) > -1)
        && (!v.project_Id)
      }).slice(0, 10);
  }

  blurHandler() {
    const managerControl = this.projectForm.controls['manager'];
    if(managerControl.value && !managerControl.value.user_Id){
      managerControl.reset();
    }
  }
}
