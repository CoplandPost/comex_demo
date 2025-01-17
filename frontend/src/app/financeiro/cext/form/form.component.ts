import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';

import { GetEmpresaService } from 'src/app/empresa/service/get-empresa.service';
import { DialogComponent } from 'src/app/shared/dialos/dialog/dialog.component';
import { CidadeService } from 'src/app/shared/service/cidade.service';
import { EstadoService } from 'src/app/shared/service/estado.service';
import { TerminalBackEndService } from '../service/backend.service';
import { Terminal } from './model/terminal.model';
import { FormValuesCompleteService } from 'src/app/comercial/service/form-values-complete.service';
import { CextClassificacaoService } from '../service/classificacao.service';
import { CextEnquadramentoService } from '../service/enquadramento.service';
import { CextTipoService } from '../service/tipo.service';
import { ImpostoBackEndService } from '../../cadastro/imposto/service/backend.service';


@Component({
  selector: 'app-form-cext',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormCextComponent implements OnInit {
  classificacoes: any;
  placeholder: any;
  enquadramentos: any;
  tipos: any;
  custos: any;
  identificador: Observable<any>;
  cidades: Observable<any>;
  estados: Observable<any>;
  propostas: Observable<any>;
  statusLista: Observable<any>;
  formulario: FormGroup;
  formEdit: Boolean = false;
  constructor(
    private formDropDown: FormValuesCompleteService,
    private empresaDropDown: GetEmpresaService,
    private cextClassificacaoService: CextClassificacaoService,
    private cextEnquadramentoService: CextEnquadramentoService,
    private cextTipoService: CextTipoService,
    private impostoBackEndService: ImpostoBackEndService,
    private sendForm: TerminalBackEndService,
    private formBuilder: FormBuilder,
    private routerAct: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cextClassificacaoService.getAll().subscribe( classificacoes =>
      this.classificacoes = classificacoes
    );
    this.cextEnquadramentoService.getAll().subscribe( classificacoes =>
      this.enquadramentos = classificacoes
    );
    this.cextTipoService.getAll().subscribe( classificacoes =>
      this.tipos = classificacoes
    );
    // this.estados = this.bkEstado.getEstado();
    // this.statusLista = this.bkStatus.getAll();
    this.identificador = this.empresaDropDown.getEmpresaPapel('fornecedor');
    this.formulario = this.formBuilder.group({
      id_cextclassificacao: [null],
      id_cextenquadramento: [null],
      id_cexttipo: [null],
      id_custo: [null],
      valor: [null,  Validators.required],
    });

      // Verifica se o formulario é passivel a popular os dados
      if (this.checkIfIsEditForm(this.routerAct)) {
        this.formEdit = true;
        // Definindo que o formulário sera apenas para edicão
        const id: string = this.routerAct.snapshot.paramMap.get('id');
        this.sendForm.getById(id).subscribe((dados: Terminal) => this.populateForm(dados));
      }

  }

  getImposto(tipo) {
    this.placeholder = tipo.selected.viewValue;
    this.impostoBackEndService.getAll().subscribe( impostos => this.custos = impostos);
  }

  backPage() {
    this.router.navigate(['/financeiro/cadastro/listaimpostos']);
  }

  checkIfIsEditForm(router: ActivatedRoute) {
    // Verifica se tem parametro id e se é um editor
    if (router.snapshot.paramMap.get('id') == null) {
      return false;
    } else {
      return true;
    }
  }

  cleanForm() {
    const form: any = this.formulario;
    form.reset();
    Object.keys(form.controls).forEach((v, k) => {
      form.controls[v].setErrors(null);
    });
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: {title: 'Imposto salvo com sucesso!'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (this.formEdit) {
        this.backPage();
      }
    });
  }

  populateForm(dados: Terminal) {
    this.formulario.patchValue({
      id_terminal: typeof(dados.id_terminal) !== 'undefined' ? dados.id_terminal : null,
      identificador: typeof(dados.id_individuo) !== 'undefined' ? dados.id_individuo : null,
      nome: typeof(dados.nome) !== 'undefined' ? dados.nome : null,
      cidade: typeof(dados.id_cidade) !== 'undefined' ? dados.id_cidade : null,
      status: typeof(dados.id_status) !== 'undefined' ? dados.id_status : null,
    });
  }

  receivedDataSubFormDocumento(event: FormGroup) {
    this.formulario.addControl('documento', event);
  }

  receivedDataSubFormContainer(event) {
    this.formulario.addControl('container', event);
  }

  onSubmite() {
    this.sendForm.save(this.formulario).subscribe((dados: {status}) => {
      if (dados.status === 'success') {
        if (!this.formEdit) {
         this.cleanForm();
        } else {
          this.router.navigate(['/captacao/terminal/lista']);
        }
      }
    });
  }
}
