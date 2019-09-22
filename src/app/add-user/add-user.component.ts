import {Component, Directive, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../session.service';
import {compare, NgbdSortableHeader, SortEvent} from '../sortable.directive';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.sass']
})
export class AddUserComponent implements OnInit {

  userGroup: FormGroup;
  filter: FormControl;
  userDataSet: any[];
  usersList: any[];
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(private sessionService: SessionService) {
    this.userGroup = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl(''),
      employee_Id: new FormControl('', Validators.required)
    });
    this.filter = new FormControl('');

    this.filter.valueChanges.subscribe(searchedString => {
      this.usersList = this.search(searchedString);
    });
  }

  ngOnInit() {
    this.getUserList();
  }

  getUserList() {
    this.sessionService.getUsers().subscribe(x => {
      this.userDataSet = x;
      this.usersList = this.userDataSet;
    });
  }

   search(text: string): any[] {
    return this.userDataSet.filter(user => {
      const term = text.toLowerCase();
      return user.project.toLowerCase().includes(term)
        || user.lastName.toLowerCase().includes(term)
        || user.employee_Id.toLowerCase().includes(term);
    });
  }

  add() {
    this.sessionService.addUser(this.userGroup.value).subscribe(x => {
      this.reset();
      this.getUserList();
    });
  }

  reset() {
    this.userGroup.reset();
  }

  onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '') {
      this.usersList = this.userDataSet;
    } else {
      this.usersList = this.userDataSet.sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

}
