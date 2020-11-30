import { Component, OnInit } from "@angular/core";
import { Clientes } from "../../models/clientes";
import { ClientesService } from "../../services/clientes.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";

@Component({
  selector: "app-clientes",
  templateUrl: "./clientes.component.html",
  styleUrls: ["./clientes.component.css"]
})
export class ClientesComponent implements OnInit {
  Titulo = "Clientes";
  TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)"
  };
  AccionABMC = "L"; // inicialmente inicia en el listado de articulos (buscar con parametros)
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
    //private articulosService: MockArticulosService,
    //private articulosFamiliasService: MockArticulosFamiliasService,
    private ventas: ClientesService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.FormFiltro = this.formBuilder.group({
      Nombre: [""],
      Activo: [true]
    });
    
    this.FormReg = this.formBuilder.group({
      IdCliente: [0],
      FechaNacimiento: [
        "",
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          )
        ]
      ],
      //Total: [null, [Validators.required, Validators.pattern("[0-9]{1,8}")]],
      Nombre: [
        "",
        [Validators.required, Validators.minLength(1), Validators.maxLength(50)]
      ]
    });
  }

  Agregar() {
    this.AccionABMC = "A";
    this.FormReg.reset({ Activo: true });
    this.submitted = false;
    //this.FormReg.markAsPristine();
    this.FormReg.markAsUntouched();
  }

  // Buscar segun los filtros, establecidos en FormReg
  Buscar() {
    this.SinBusquedasRealizadas = false;
    this.ventas.get().subscribe((res: any) => {
      this.Lista = res;
    });
  }

  // grabar tanto altas como modificaciones
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormReg.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormReg.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.Fecha.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.Fecha = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    // agregar post
    if (itemCopy.IdVenta == 0 || itemCopy.IdVenta == null) {
      itemCopy.IdVenta = 0;
      this.ventas.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert("Registro agregado correctamente.");
        this.Buscar();
      });
    }
  }

  // Volver desde Agregar/Modificar
  Volver() {
    this.AccionABMC = "L";
  }
}
