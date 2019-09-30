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
  addButtonLabel: string = 'Add';
  cancelButtonLabel: string = 'Reset';
  showAdd:boolean = true;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(private sessionService: SessionService) {
    this.userGroup = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl(''),
      employeeId: new FormControl('', Validators.required),
      user_id : new FormControl('')
    });
    this.filter = new FormControl('');

    this.filter.valueChanges.subscribe(searchedString => {
      this.usersList = this.search(searchedString);
    });
  }

  ngOnInit() {
    this.getUserList();
  }

  updateUser(user: any) {
    console.log(user);
    this.userGroup.setValue({firstName: user.firstName,
      lastName: user.lastName, employeeId: user.employeeId,user_id: user.user_Id});

   // this.showUpdate=true;
    this.showAdd=false;
  }

  deleteUser(user: any) {
    console.log('delete user ' + user);

    const that = this;
    this.sessionService.deleteUser(user).subscribe(x=>{
      that.getUserList();
    });
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
        || user.employeeId.toLowerCase().includes(term);
    });
  }

  add() {
    this.sessionService.addUser(this.userGroup.value).subscribe(x => {
      this.reset();
      this.getUserList();
    });
  }

  update(){
   this.sessionService.updateUser(this.userGroup.value).subscribe(x => {
        this.reset();
        this.getUserList();
      });
  }

  reset() {
    this.userGroup.reset();
    this.addButtonLabel = 'Add';
    this.cancelButtonLabel = 'Reset';
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
