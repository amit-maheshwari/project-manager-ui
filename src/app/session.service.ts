import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {HttpParams} from '@angular/common/http';
import {Observable, of, BehaviorSubject} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  showAlert: boolean;
  errorMessage: any;
  private _userList: any = [];
  private _projectList: any = [];
  private _parentTaskList: any = [];

  constructor(private http: HttpClient) {
    this.loadUserList();
    this.loadProjectList();
    this.loadParentTaskList();
  }

  get userList() {
    return this._userList;
  }

  get projectList() {
    return this._projectList;
  }

  get parentTasksList() {
    return this._parentTaskList;
  }

  loadUserList() {
    this.getUsers().subscribe(x => {
      this._userList = x;
    });
  }

  loadProjectList() {
    this.getProjectsList().subscribe(x => {
      this._projectList = x;
    });
  }
  loadParentTaskList() {
    this.getParentTaskLists().subscribe(x => {
      this._parentTaskList = x;
    });
  }

  getUsers(): Observable<any> {
  //  return this.http.get('./assets/user.json');
    return this.http.get('http://192.168.1.72:8080/fsd/users');
  }

  addUser(user: any): Observable<any> {
    console.log(user);
    return this.http.post("http://localhost:8080/fsd/users",user).
       pipe(catchError((error )=> {
         this.errorMessage = error && error.message ? error.message: "There seems to be error !!!";
         this.showAlert = true;
         return of(null);
       }));
       }

  updateUser(user: any): Observable<any> {
    console.log(user);
    let url = `http://localhost:8080/fsd/users/${user.user_Id}`;
    return this.http.put(url, user);
  }

  deleteUser(user: any) {
    let url = `http://localhost:8080/fsd/users/${user.user_Id}`;
    return this.http.delete(url);
  }

  addTask(task: any): Observable<any> {
    return this.http.post('http://localhost:8080/fsd/tasks',task);
  }

  updateTask(editedTask: any):Observable<any> {
    let url = `http://localhost:8080/fsd/tasks/${editedTask.task_id}`;
    return this.http.put(url,editedTask);
  }

  getProjectsList(): Observable<any> {
    // return this.http.get('./assets/project.json');
    return this.http.get('http://localhost:8080/fsd/projects');
  }

  addProject(projects: any): Observable<any> {
    console.log(projects);
    const _this = this;
    return this.http.post("http://localhost:8080/fsd/projects", projects).
    pipe(catchError(error => {
      this.errorMessage = error && error.message ? error.message: "There seems to be error !!!";
      this.showAlert = true;
      return of(null);
    }));
  }

  handleError(err){
  //alert("ERROR"+err);
    this.errorMessage = err && err.message ? err.message: "There seems to be error !!!";
    this.showAlert = true;
    return of(null);
  }

  updateProject(project: any, projectId :any): Observable<any> {
    console.log(project);
    let url = `http://localhost:8080/fsd/projects/${projectId}`;
    return this.http.put(url, project).
    pipe(catchError(error => {
      this.errorMessage = error && error.message ? error.message: "There seems to be error !!!";
      this.showAlert = true;
      return of(null);
    }));;
  }

  deleteProject(projectId: any): Observable<any>{
    let url = `http://localhost:8080/fsd/projects/${projectId}`;
    return this.http.delete(url);
  }

  getTaskLists(): Observable<any> {
    return this.http.get("http://localhost:8080/fsd/tasks");
    //return this.http.get("http://localhost:8080/fsd/tasks");
  }

  getParentTaskLists(): Observable<any> {
    return this.http.get("http://localhost:8080/fsd/parentTasks");
  }

  managerSearch(term:any): Observable<any> {
    return this.http.get('http://localhost:8080/fsd/users');
  }

  getUserById(userId:any){
    let url = `http://localhost:8080/fsd/users/${userId}`;
    return this.http.get(url);
  }
}
