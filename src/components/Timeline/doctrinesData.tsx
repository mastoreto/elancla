import React from 'react';
import {
  MdMenuBook,
  MdPublic,
  MdChurch,
  MdWaterDrop,
  MdAccessibilityNew,
  MdVolunteerActivism,
  MdGroups,
  MdWater,
  MdHourglassEmpty,
} from 'react-icons/md';
import type { Doctrine } from './types';
import { DoctrineModalContent } from './DoctrineModalContent';
import { SectionTitle } from './SectionTitle';
import { RefList } from './RefList';

export const doctrines: Doctrine[] = [
  {
    id: 'dios',
    number: '01',
    title: 'Dios',
    description:
      'Creemos en un solo Dios verdadero, Creador y soberano del universo, quien hizo todas las cosas de la nada y las sostiene por su poder.',
    icon: MdPublic,
    fullContent: (
      <DoctrineModalContent
        number="01"
        title="Dios"
        icon={MdPublic}
        quote="Oye, Israel: Jehová nuestro Dios, Jehová uno es."
        quoteRef="Deuteronomio 6:4"
      >
        <p>
          Creemos en un solo Dios verdadero, Creador y soberano del universo,
          quien hizo todas las cosas de la nada y las sostiene por su poder.
        </p>

        <SectionTitle>Naturaleza</SectionTitle>
        <p>
          Este Dios único existe eternamente en tres Personas: Padre, Hijo y
          Espíritu Santo, iguales en esencia, poder y gloria, pero distintos en
          sus funciones.
        </p>

        <SectionTitle>Relación entre las personas</SectionTitle>
        <p>
          Los tres comparten la misma naturaleza divina y actúan en perfecta
          unidad.
        </p>
        <RefList
          refs={[
            'Deuteronomio 6:4',
            'Génesis 1:1-2',
            'Salmo 104:24',
            'Salmo 33:6',
            'Hebreos 1:3',
            'Mateo 3:16-17',
            'Mateo 28:19',
            '2 Corintios 13:14',
            '1 Corintios 8:4-6',
            'Juan 10:30',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'jesucristo',
    number: '02',
    title: 'Jesucristo',
    description:
      'Jesucristo es el eterno Hijo de Dios, consustancial con el Padre y el Espíritu Santo. Su muerte y resurrección son la base de nuestra salvación.',
    icon: MdChurch,
    fullContent: (
      <DoctrineModalContent
        number="02"
        title="Jesucristo"
        subtitle={<>Jesucristo</>}
        icon={MdChurch}
        quote="Porque hay un solo Dios, y un solo mediador entre Dios y los hombres, Jesucristo hombre."
        quoteRef="1 Timoteo 2:5"
      >
        <SectionTitle>Identidad</SectionTitle>
        <p>
          Jesucristo es el eterno Hijo de Dios, consustancial con el Padre y el
          Espíritu Santo.
        </p>

        <SectionTitle>Vida</SectionTitle>
        <p>
          Nacido de la virgen María por obra del Espíritu Santo, vivió una vida
          humana perfecta y sin pecado.
        </p>

        <SectionTitle>Muerte</SectionTitle>
        <p>
          Entregó su vida en la cruz como sacrificio perfecto y suficiente para
          la expiación de los pecados de su pueblo.
        </p>

        <SectionTitle>Resurrección</SectionTitle>
        <p>
          Resucitó corporalmente al tercer día, demostrando su victoria sobre el
          pecado y la muerte.
        </p>

        <SectionTitle>Ascensión y regreso</SectionTitle>
        <p>
          Ascendió al cielo, se sentó a la diestra del Padre y volverá en gloria
          como Rey y Señor de señores.
        </p>

        <RefList
          refs={[
            'Juan 1:1,14',
            'Colosenses 2:9',
            'Mateo 1:18-23',
            'Lucas 1:35',
            '1 Pedro 2:22-24',
            '2 Corintios 5:21',
            'Hebreos 4:15',
            '1 Pedro 3:18',
            'Colosenses 2:13-14',
            'Isaías 53:4-6',
            '1 Corintios 15:3-4',
            'Mateo 28:5-7',
            'Romanos 4:25',
            'Marcos 16:19',
            'Hechos 1:9-11',
            'Apocalipsis 1:7',
            'Tito 2:13',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'espiritu',
    number: '03',
    title: 'El Espíritu Santo',
    description:
      'La tercera Persona de la Trinidad, plenamente Dios, quien convence de pecado, regenera, mora en el creyente y guía a toda verdad.',
    icon: MdWaterDrop,
    fullContent: (
      <DoctrineModalContent
        number="03"
        title="El Espíritu Santo"
        subtitle={
          <>
            Espíritu
            <br />
            Santo
          </>
        }
        icon={MdWaterDrop}
        quote="Mas el Consolador, el Espíritu Santo, a quien el Padre enviará en mi nombre, él os enseñará todas las cosas."
        quoteRef="Juan 14:26"
      >
        <SectionTitle>Identidad</SectionTitle>
        <p>
          El Espíritu Santo es la tercera Persona de la Trinidad, plenamente
          Dios, con los mismos atributos divinos que el Padre y el Hijo.
        </p>

        <SectionTitle>Obra</SectionTitle>
        <ul className="list-disc pl-5 space-y-2">
          <li>Convence al mundo de pecado, justicia y juicio.</li>
          <li>Regenera y da vida nueva al creyente.</li>
          <li>Mora permanentemente en cada cristiano desde la conversión.</li>
          <li>Enseña y guía a toda verdad.</li>
          <li>Concede dones espirituales para la edificación de la Iglesia.</li>
        </ul>

        <SectionTitle>Vida cristiana</SectionTitle>
        <p>
          El creyente debe vivir bajo el control del Espíritu, produciendo fruto
          espiritual.
        </p>

        <RefList
          refs={[
            'Hechos 5:3-4',
            'Juan 16:8-11',
            'Juan 3:5-8',
            'Tito 3:5',
            'Efesios 1:13-14',
            'Juan 14:26',
            'Juan 16:13',
            '1 Corintios 12:4-11',
            'Gálatas 5:16-25',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'biblia',
    number: '04',
    title: 'La Biblia',
    description:
      'La Palabra de Dios inspirada, inerrante e infalible. Es nuestra autoridad final y suficiente para la fe y la práctica.',
    icon: MdMenuBook,
    fullContent: (
      <DoctrineModalContent
        number="04"
        title="La Biblia"
        icon={MdMenuBook}
        quote="Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia."
        quoteRef="2 Timoteo 3:16"
      >
        <SectionTitle>Naturaleza</SectionTitle>
        <p>
          La Biblia, compuesta por el Antiguo y Nuevo Testamento, es la Palabra
          de Dios inspirada, inerrante en sus escritos originales e infalible en
          todo lo que afirma.
        </p>

        <SectionTitle>Autoridad</SectionTitle>
        <p>
          Es la revelación final y suficiente de Dios para guiar la fe y la
          práctica, y no puede ser añadida ni quitada.
        </p>
        <RefList
          refs={[
            '2 Timoteo 3:16',
            '2 Pedro 1:20-21',
            'Salmo 19:7-11',
            'Mateo 4:4',
            'Apocalipsis 22:18-19',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'iglesia',
    number: '05',
    title: 'La Iglesia',
    description:
      'El cuerpo de Cristo, compuesto por todos los creyentes verdaderos, expresado localmente para adorar, servir y proclamar.',
    icon: MdGroups,
    fullContent: (
      <DoctrineModalContent
        number="05"
        title="La Iglesia"
        icon={MdGroups}
        quote="Y sometió todas las cosas bajo sus pies, y lo dio por cabeza sobre todas las cosas a la iglesia."
        quoteRef="Efesios 1:22"
      >
        <SectionTitle>Identidad</SectionTitle>
        <p>
          La Iglesia es el cuerpo de Cristo, compuesta por todos los creyentes
          verdaderos (<b>iglesia universal</b>) y expresada localmente en
          congregaciones que se reúnen para adorar, enseñar, servir y cumplir la
          misión de Cristo (<b>iglesia local</b>).
        </p>

        <SectionTitle>Propósito y función</SectionTitle>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Glorificar a Dios.</li>
          <li>Edificación del creyente.</li>
          <li>Proclamar el evangelio.</li>
        </ol>

        <SectionTitle>Dinámica interna</SectionTitle>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <b>Relación:</b> Cada creyente debe cultivar un vínculo profundo y
            activo con su iglesia local.
          </li>
          <li>
            <b>Dependencia:</b> Los miembros del cuerpo dependen unos de otros
            para cumplir la misión.
          </li>
          <li>
            <b>Servicio:</b> Los dones espirituales deben ejercerse para
            edificación mutua.
          </li>
          <li>
            <b>Trabajo:</b> La vida cristiana implica participación intencional
            y activa en la obra de la Iglesia.
          </li>
        </ul>

        <RefList
          refs={[
            'Efesios 1:22-23',
            'Hechos 2:42',
            'Efesios 3:21',
            '1 Pedro 2:9',
            'Efesios 4:11-13',
            'Mateo 28:19-20',
            'Hebreos 10:24-25',
            'Romanos 12:4-5',
            '1 Pedro 4:10',
            '1 Corintios 15:58',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'hombre',
    number: '06',
    title: 'El Hombre',
    description:
      'Creado a imagen de Dios, pero caído y bajo condenación, muerto espiritualmente y en necesidad de redención.',
    icon: MdAccessibilityNew,
    fullContent: (
      <DoctrineModalContent
        number="06"
        title="El Hombre"
        icon={MdAccessibilityNew}
        quote="Y creó Dios al hombre a su imagen, a imagen de Dios lo creó; varón y hembra los creó."
        quoteRef="Génesis 1:27"
      >
        <SectionTitle>Origen</SectionTitle>
        <p>Creado a imagen y semejanza de Dios para reflejar su gloria.</p>

        <SectionTitle>Condición actual</SectionTitle>
        <p className="mb-2">
          Por el pecado de Adán, toda la humanidad está bajo condenación,
          corrompida en todas las áreas de su ser (<b>depravación total</b>).
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Enemigo de Dios.</li>
          <li>No quiere ni puede agradar a Dios.</li>
          <li>Muerto espiritualmente y esclavo del pecado.</li>
        </ul>

        <RefList
          refs={[
            'Génesis 1:26-27',
            'Romanos 5:10',
            'Colosenses 1:21',
            'Romanos 8:7-8',
            'Jeremías 17:9',
            'Génesis 6:5',
            'Efesios 2:1-3',
            'Juan 8:34',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'salvacion',
    number: '07',
    title: 'La Salvación',
    description:
      'Es por gracia, a través de la fe en Cristo, no por obras. Un regalo gratuito de Dios que incluye elección, justificación y santificación.',
    icon: MdVolunteerActivism,
    fullContent: (
      <DoctrineModalContent
        number="07"
        title="La Salvación"
        subtitle={
          <>
            La
            <br />
            Salvación
          </>
        }
        icon={MdVolunteerActivism}
        quote="Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios."
        quoteRef="Efesios 2:8"
      >
        <SectionTitle>Definición</SectionTitle>
        <p>
          Obra soberana de Dios que rescata al pecador por gracia, mediante la
          fe en Jesucristo.
        </p>

        <SectionTitle>Aspectos</SectionTitle>
        <ul className="list-disc pl-5 space-y-2">
          <li>Elección</li>
          <li>Justificación</li>
          <li>Regeneración</li>
          <li>Santificación</li>
          <li>Glorificación</li>
        </ul>

        <SectionTitle>Seguridad</SectionTitle>
        <p>El creyente está guardado por el poder de Dios hasta el fin.</p>

        <RefList
          refs={[
            'Efesios 2:8-9',
            'Tito 3:5',
            'Efesios 1:4-5',
            'Romanos 3:24-26',
            'Juan 3:5-8',
            '1 Tesalonicenses 4:3',
            'Romanos 8:30',
            'Juan 10:28',
            'Filipenses 1:6',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'ordenanzas',
    number: '08',
    title: 'Ordenanzas',
    description:
      'Practicamos el Bautismo por inmersión y la Cena del Señor como actos de obediencia, símbolo y memoria.',
    icon: MdWater,
    fullContent: (
      <DoctrineModalContent
        number="08"
        title="Ordenanzas"
        icon={MdWater}
        quote="Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo."
        quoteRef="Mateo 28:19"
      >
        <SectionTitle>a) Bautismo por inmersión</SectionTitle>
        <p>
          Símbolo de la unión con Cristo en su muerte, sepultura y resurrección.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Referencias: Mateo 3:13-16; Hechos 8:36-38; Romanos 6:4
        </div>

        <SectionTitle>b) Cena del Señor</SectionTitle>
        <p>Memorial de la obra de Cristo y proclamación de su regreso.</p>
        <div className="mt-2 text-xs text-gray-500">
          Referencias: 1 Corintios 11:23-26
        </div>

        <RefList
          refs={[
            'Mateo 3:13-16',
            'Hechos 8:36-38',
            'Romanos 6:4',
            '1 Corintios 11:23-26',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
  {
    id: 'escatologia',
    number: '09',
    title: 'Escatología',
    description:
      'Cristo regresará personal, visible y gloriosamente para consumar la historia y establecer cielos nuevos y tierra nueva.',
    icon: MdHourglassEmpty,
    fullContent: (
      <DoctrineModalContent
        number="09"
        title="Escatología"
        subtitle={
          <>
            Segunda
            <br />
            Venida
          </>
        }
        icon={MdHourglassEmpty}
        quote="He aquí yo vengo pronto, y mi galardón conmigo, para recompensar a cada uno según sea su obra."
        quoteRef="Apocalipsis 22:12"
      >
        <p>
          Cristo regresará personal, visible y gloriosamente para consumar la
          historia y establecer cielos nuevos y tierra nueva.
        </p>

        <SectionTitle>Para la Iglesia, esta esperanza es:</SectionTitle>
        <ul className="list-disc pl-5 space-y-2">
          <li>Una esperanza viva.</li>
          <li>Motivo de consuelo.</li>
          <li>Estímulo para santidad y servicio.</li>
        </ul>

        <RefList
          refs={[
            'Hechos 1:9-11',
            'Mateo 24:30',
            'Apocalipsis 22:12',
            'Tito 2:13',
            '1 Pedro 1:13',
            '1 Tesalonicenses 4:18',
            '1 Juan 3:2-3',
          ]}
        />
      </DoctrineModalContent>
    ),
  },
];
