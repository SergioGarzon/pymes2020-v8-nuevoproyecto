import { Component, OnInit } from '@angular/core';
import { Clientes } from "../../models/clientes";
import { ClientesService } from "../../services/clientes.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent  implements OnInit {
  Titulo = "Clientes";
  TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)"
  };
  AccionABMC = "L"; // inicialmente inicia en el listado de paises (buscar con parametros)
  Mensajes = {
    SD: " No se encontraron registros...",
    RD: " Revisar los datos ingresados..."
  };

  Lista: Clientes[] = [];
  RegistrosTotal: number;
  SinBusquedasRealizadas = true;

  Pagina = 1; // inicia pagina 1

  FormFiltro: FormGroup;
  FormReg: FormGroup;
  submitted = false;

  constructor(
    public formBuilder: FormBuilder,
    private ClientesService: ClientesService,
    private modalDialogService: ModalDialogService
  ) { }

  ngOnInit() {
    this.FormReg = this.formBuilder.group({
      IdPais: [0],
      Nombre: [
        "",
        [Validators.required, Validators.minLength(4), Validators.maxLength(30)]
      ],
      FechaCenso: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          )
        ]
      ],
      Poblacion: [null, [Validators.required, Validators.pattern("[0-9]{1,10}")]],
    });
  }

  Agregar() {
    this.AccionABMC = "A";
    //this.FormReg.reset({ Activo: true });
    this.submitted = false;
    this.FormReg.markAsUntouched();
  }

  
  Buscar() {
    this.SinBusquedasRealizadas = false;
    this.ClientesService
      .get()
      .subscribe((res: any) => {
        this.Lista = res;
        this.RegistrosTotal = res.RegistrosTotal;
      });
  }

  BuscarPorId(Dto, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.ClientesService.getById(Dto.IdCliente).subscribe((res: any) => {
      this.FormReg.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaCenso.substr(0, 10).split("-");
      this.FormReg.controls.FechaCenso.patchValue(
        arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]
      );

      this.AccionABMC = AccionABMC;
    });
  }

  Consultar(Dto) {
    this.BuscarPorId(Dto, "C");
  }

  
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormReg.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormReg.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.FechaCenso.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.FechaCenso = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    // agregar post
    if (itemCopy.IdCliente == 0 || itemCopy.IdCliente == null) {
      itemCopy.IdCliente = 0;
      this.ClientesService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert("Registro agregado correctamente.");
        this.Buscar();
      });
    }
  }

  Volver() {
    this.AccionABMC = "L";
  }

}