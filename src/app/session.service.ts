import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpParams} from '@angular/common/http';
import {Observable, of, BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private _userList: BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this._userList = new BehaviorSubject<any>(null);
    this.loadUserList();
  }



  get userList():BehaviorSubject<any>{
    return this._userList;
  }

  addTask(task: any):Observable<any> {
      return this.http.post('http://localhost:8080/fsd/tasks',task);
  }

  getUsers():Observable<any> {
    //return this.http.get('./assets/users.json');
    return this.http.get('http://localhost:8080/fsd/users');
  }

  loadUserList() {

      this.getUsers().subscribe(x=>{
                            this._userList = x;
      });

  }

  addUser(user: any):Observable<any> {
    console.log(user);
   return this.http.post("http://localhost:8080/fsd/users",user);
    //return of([{user}]);
  }

  updateUser(user: any):Observable<any> {
     console.log(user);
     let url = `http://localhost:8080/fsd/users/${user.user_Id}`;
    return this.http.put(url,user);
     //return of([{user}]);
   }

  deleteUser(user: any) {
  let url = `http://localhost:8080/fsd/users/${user.user_Id}`;
    return this.http.delete(url);
  }

  getProjectsList(): Observable<any> {
    return this.http.get('http://localhost:8080/fsd/projects');
  }

  addProject(projects: any): Observable<any> {
    console.log(projects);
    return this.http.post("http://localhost:8080/fsd/projects",projects);

  }

  deleteProject(projectId: any): Observable<any>{
  let url = `http://localhost:8080/fsd/projects/${projectId}`;
      return this.http.delete(url);
    }

  getTaskLists(): Observable<any> {
    return this.http.get("http://localhost:8080/fsd/tasks");
  }

  managerSearch(term:any): Observable<any> {
    return this.http.get('http://localhost:8080/fsd/users');
  }

  getUserById(userId:any){
  let url = `http://localhost:8080/fsd/users/${userId}`;
    return this.http.get(url);
  }
}
