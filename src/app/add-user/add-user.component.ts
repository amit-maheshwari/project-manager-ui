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
    this.cancelButtonLabel='Cancel';
  }

  deleteUser(user: any) {
    console.log('delete user ' + user);
    if(confirm("Are you sure to delete user "+user.firstName +" ?")) {
      const that = this;
      this.sessionService.deleteUser(user).subscribe(x=>{
        that.getUserList();
      });
    }
  }

  getUserList() {
    this.sessionService.getUsers().subscribe(x => {
     this.userDataSet = x;
      this.usersList = this.userDataSet;
      this.sessionService.updateUserList(x);
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
    this.cancelButtonLabel = 'Reset';
    this.showAdd=true;
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

  numberOnly(event): boolean {
      const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;

    }

}
