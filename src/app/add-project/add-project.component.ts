import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../session.service';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {compare, NgbdSortableHeader, SortEvent} from '../sortable.directive';
import {ajax} from 'rxjs/ajax';

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
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(private sessionService: SessionService) {
    this.projectForm = new FormGroup({
      project: new FormControl('', Validators.required),
      startDate: new FormControl(''),
      endDate: new FormControl('', Validators.required),
      priority: new FormControl('', Validators.required),
      manager: new FormControl('', Validators.required)
    });

    this.filter = new FormControl('');

    this.filter.valueChanges.subscribe(searchedString => {
      this.filteredProjects = this.filterProjectList(searchedString);
    });
  }

  ngOnInit() {
    this.getProjectList();
  }

  getProjectList() {
    this.sessionService.getProjectsList().subscribe(x => {
      this.projectList = x;
      this.filteredProjects = this.projectList;
    });
  }

  add() {
    this.sessionService.addProject(this.projectForm.value).subscribe(x=>{
      console.log(x);
    });
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
    const sd = selectedProject.startDate.split('-');
    const ed = selectedProject.endDate.split('-');
    const processedStartDate = {year: Number(sd[2]), month: Number(sd[1]) , day: Number(sd[0])};
    const processedEndDate = {year: Number(ed[2]), month: Number(ed[1]), day: Number(ed[0])};
    this.projectForm.setValue({project: selectedProject.project,
      startDate: processedStartDate, endDate: processedEndDate, priority: selectedProject.priority, manager: selectedProject.manager});
  }

  type = (text$: Observable<string>) =>
    text$.pipe(
      filter(text => text.length > 2),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => ajax('./assets/manager.json')),
      map(response => response.response)
    );

  formatter = (result: any) => result.project;
}
